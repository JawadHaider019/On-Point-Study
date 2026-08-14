import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatGBP } from '../../utils/formatters';
import { FileCheck2, X } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const ClaimModal = ({
  studentId,
  instalmentNumber,
  onClose,
}) => {
  const { getStudentWithCommission, submitClaim } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);
  const data = getStudentWithCommission(studentId);

  if (!data || !data.student || !data.commission) return null;

  const { student, commission } = data;
  const instalment = commission.instalments.find((i) => i.number === instalmentNumber);

  if (!instalment) return null;

  const handleConfirmSubmit = () => {
    submitClaim(studentId, instalmentNumber);
    setShowConfirm(false);
    onClose();
  };

  return (
    <div
      id="claim-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="claim-modal-container"
        className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-slate-900"
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <FileCheck2 className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <h3 className="text-base font-bold">Submit Commission Claim</h3>
              <p className="text-xs text-blue-100">Review instalment details before submitting</p>
            </div>
          </div>
          <button
            id="claim-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Student Name</span>
              <span className="font-bold text-slate-900">{student.name}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Student ID & University</span>
              <span className="font-semibold text-slate-800">
                {student.id} • {student.university}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Instalment</span>
              <span className="font-bold text-blue-700">
                Instalment #{instalment.number} ({instalment.label})
              </span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-500 font-medium">Claim Amount</span>
              <span className="text-lg font-black text-slate-900">
                {formatGBP(instalment.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            id="claim-cancel-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            id="claim-confirm-submit-btn"
            onClick={() => setShowConfirm(true)}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Confirm & Submit Claim</span>
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Confirm Submission"
        message={`Are you sure you want to submit a commission claim of ${formatGBP(instalment.amount)} for ${student.name} (Instalment #${instalment.number})?`}
        confirmText="Submit Claim Now"
        variant="primary"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

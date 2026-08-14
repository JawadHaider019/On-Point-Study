import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatGBP } from '../../utils/formatters';
import { SlidersHorizontal, X } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const AdjustCommissionModal = ({ studentId, onClose }) => {
  const { getStudentWithCommission, adjustCommission } = useApp();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const data = getStudentWithCommission(studentId);

  if (!data || !data.student || !data.commission) return null;

  const { student, commission } = data;

  const [newTotal, setNewTotal] = useState(commission.totalCommission);
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTotal || newTotal <= 0) {
      setErrorMsg('Please enter a valid total commission amount.');
      return;
    }
    if (newTotal < commission.paid) {
      setErrorMsg(`New total commission cannot be less than already paid commission (${formatGBP(commission.paid)}).`);
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('A reason for adjusting the commission amount is required.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = () => {
    adjustCommission(studentId, newTotal, reason.trim());
    setShowConfirmModal(false);
    onClose();
  };

  return (
    <div
      id="adjust-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="adjust-modal-container"
        className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-slate-900"
      >
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <SlidersHorizontal className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="text-base font-bold">Adjust Commission Amount</h3>
              <p className="text-xs text-blue-100">Admin Only • Audit Logged</p>
            </div>
          </div>
          <button
            id="adjust-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-bold">{student.name} ({student.id})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Total Commission:</span>
              <span className="font-bold">{formatGBP(commission.totalCommission)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Already Paid:</span>
              <span className="font-bold text-emerald-600">{formatGBP(commission.paid)}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              New Agreed Total Commission (£)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
              <input
                id="adjust-new-total-input"
                type="number"
                min={commission.paid}
                value={newTotal}
                onChange={(e) => {
                  setErrorMsg('');
                  setNewTotal(Number(e.target.value));
                }}
                className="w-full pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Mandatory Reason for Adjustment
            </label>
            <textarea
              id="adjust-reason-textarea"
              rows={3}
              required
              value={reason}
              onChange={(e) => {
                setErrorMsg('');
                setReason(e.target.value);
              }}
              placeholder="e.g. Renegotiated agreement with university; additional bonus fee granted..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          {errorMsg && (
            <div id="adjust-error-alert" className="p-2.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              id="adjust-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              id="adjust-submit-btn"
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Apply Adjustment</span>
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Commission Adjustment"
        message={`Are you sure you want to change the total agreed commission for ${student.name} from ${formatGBP(commission.totalCommission)} to ${formatGBP(newTotal)}?`}
        confirmText="Apply Adjustment"
        variant="warning"
        onConfirm={handleFinalSubmit}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

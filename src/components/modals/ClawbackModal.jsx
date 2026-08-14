import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatGBP } from '../../utils/formatters';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const ClawbackModal = ({ studentId, onClose }) => {
  const { getStudentWithCommission, requestClawback } = useApp();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const data = getStudentWithCommission(studentId);

  if (!data || !data.student || !data.commission) return null;

  const { student, commission } = data;

  const [amount, setAmount] = useState(commission.paid > 0 ? commission.paid : 500);
  const [reasonCategory, setReasonCategory] = useState(
    'Student withdrew from course after commission payment'
  );
  const [customReason, setCustomReason] = useState('');
  const [confirmedCheck, setConfirmedCheck] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setErrorMsg('Please enter a valid clawback amount.');
      return;
    }
    if (amount > commission.paid) {
      setErrorMsg(`Clawback amount (£${amount}) cannot exceed total commission paid (£${commission.paid}).`);
      return;
    }
    if (!confirmedCheck) {
      setErrorMsg('Please confirm that you have reviewed the clawback policy before proceeding.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = () => {
    const finalReason = customReason ? `${reasonCategory} - ${customReason}` : reasonCategory;
    requestClawback(studentId, amount, finalReason);
    setShowConfirmModal(false);
    onClose();
  };

  return (
    <div
      id="clawback-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="clawback-modal-container"
        className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-slate-900"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-orange-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <ShieldAlert className="w-5 h-5 text-orange-200" />
            </div>
            <div>
              <h3 className="text-base font-bold">Request Commission Clawback</h3>
              <p className="text-xs text-orange-100">Admin Only • Financial Adjustment</p>
            </div>
          </div>
          <button
            id="clawback-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs flex items-start gap-2 text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Important Notice:</span> Initiating a clawback will flag this student record as{' '}
              <span className="underline font-semibold">Clawback Requested</span> and issue a clawback invoice notice to the agent ({student.agentName}).
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Student: <strong className="text-slate-900">{student.name}</strong></span>
              <span>Total Paid: <strong className="text-emerald-700">{formatGBP(commission.paid)}</strong></span>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Clawback Amount (£)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
              <input
                id="clawback-amount-input"
                type="number"
                min="1"
                max={commission.paid || 10000}
                value={amount}
                onChange={(e) => {
                  setErrorMsg('');
                  setAmount(Number(e.target.value));
                }}
                className="w-full pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none font-bold"
              />
            </div>
            <p className="text-[11px] text-slate-500">Maximum clawback amount is {formatGBP(commission.paid)}.</p>
          </div>

          {/* Reason Category dropdown */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Primary Reason
            </label>
            <select
              id="clawback-reason-category-select"
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
            >
              <option value="Student withdrew from course after commission payment">
                Student withdrew from course after commission payment
              </option>
              <option value="Tuition fee refund issued to student by university">
                Tuition fee refund issued to student by university
              </option>
              <option value="Visa revocation / Enrolment cancellation post-census">
                Visa revocation / Enrolment cancellation post-census
              </option>
              <option value="Duplicate commission claim adjustment">
                Duplicate commission claim adjustment
              </option>
              <option value="Other administrative clawback">Other administrative clawback</option>
            </select>
          </div>

          {/* Additional details */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Additional Audit Notes (Optional)
            </label>
            <textarea
              id="clawback-notes-textarea"
              rows={2}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="e.g. University finance memo ref #9982..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 pt-2 text-xs text-slate-600 cursor-pointer">
            <input
              id="clawback-confirm-checkbox"
              type="checkbox"
              checked={confirmedCheck}
              onChange={(e) => {
                setErrorMsg('');
                setConfirmedCheck(e.target.checked);
              }}
              className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
            />
            <span>I confirm this clawback request has been reviewed and approved by finance management.</span>
          </label>

          {errorMsg && (
            <div id="clawback-error-alert" className="p-2.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              id="clawback-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              id="clawback-submit-btn"
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Submit Clawback Request</span>
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Clawback Request"
        message={`Are you sure you want to request a clawback of ${formatGBP(amount)} for student ${student.name}? An invoice notice will be dispatched to ${student.agentName}.`}
        confirmText="Confirm & Issue Clawback"
        variant="danger"
        onConfirm={handleFinalSubmit}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

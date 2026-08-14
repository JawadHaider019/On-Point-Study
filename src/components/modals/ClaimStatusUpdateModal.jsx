import React, { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, FileText, X } from 'lucide-react';
import { formatGBP } from '../../utils/formatters';

export const ClaimStatusUpdateModal = ({
  isOpen,
  claim,
  targetStatus,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [paidDate, setPaidDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      const today = new Date();
      setPaidDate(today.toISOString().split('T')[0]);
      setErrorMsg('');
    }
  }, [isOpen, targetStatus]);

  if (!isOpen || !claim) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (['Withdrawn', 'Not Eligible', 'Rejected'].includes(targetStatus) && !reason.trim()) {
      setErrorMsg(`A reason is required to mark this claim as ${targetStatus}.`);
      return;
    }
    onConfirm(reason.trim(), targetStatus === 'Paid' ? paidDate : null);
  };

  const isPaid = targetStatus === 'Paid';
  
  const getTheme = () => {
    switch (targetStatus) {
      case 'Paid':
        return {
          title: 'Mark Claim as Paid',
          subtitle: 'Enter payment disbursement date',
          headerBg: 'bg-gradient-to-r from-emerald-600 to-teal-700',
          btnBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg',
          icon: <Calendar className="w-5 h-5 text-emerald-200" />,
        };
      case 'Rejected':
        return {
          title: 'Reject Commission Claim',
          subtitle: 'State rejection reason for agent feedback',
          headerBg: 'bg-gradient-to-r from-rose-600 to-red-700',
          btnBg: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-md hover:shadow-lg',
          icon: <AlertTriangle className="w-5 h-5 text-rose-200" />,
        };
      case 'Withdrawn':
        return {
          title: 'Withdraw Commission Claim',
          subtitle: 'State withdrawal reason for record keeping',
          headerBg: 'bg-gradient-to-r from-slate-600 to-slate-700',
          btnBg: 'bg-gradient-to-r from-slate-600 to-slate-600 hover:from-slate-700 hover:to-slate-700 text-white shadow-md hover:shadow-lg',
          icon: <FileText className="w-5 h-5 text-slate-200" />,
        };
      case 'Not Eligible':
      default:
        return {
          title: 'Mark Claim as Not Eligible',
          subtitle: 'State eligibility reasoning for records',
          headerBg: 'bg-gradient-to-r from-amber-600 to-orange-700',
          btnBg: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg',
          icon: <AlertTriangle className="w-5 h-5 text-amber-200" />,
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      id="status-update-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="status-update-modal-container"
        className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-slate-900"
      >
        {/* Header */}
        <div className={`p-4 px-5 text-white flex items-center justify-between ${theme.headerBg}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              {theme.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">{theme.title}</h3>
              <p className="text-[10px] text-white/80 font-medium">{theme.subtitle}</p>
            </div>
          </div>
          <button
            id="status-update-modal-close-btn"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Student Context Card */}
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs space-y-1.5 font-medium text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400 font-normal">Student:</span>
              <span className="font-bold text-slate-900">{claim.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-normal">University:</span>
              <span className="text-slate-900">{claim.university}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200/80 pt-1.5 mt-1.5">
              <span className="text-slate-400 font-normal">Amount:</span>
              <span className="font-extrabold text-blue-900">{formatGBP(claim.amount)}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl animate-shake">
              {errorMsg}
            </div>
          )}

          {isPaid ? (
            /* Paid date selector */
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Payment Disbursement Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="status-update-paid-date"
                type="date"
                required
                value={paidDate}
                onChange={(e) => {
                  setErrorMsg('');
                  setPaidDate(e.target.value);
                }}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
              />
            </div>
          ) : (
            /* Reason text input */
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Reason for Status Change <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="status-update-reason-textarea"
                rows={3}
                placeholder={`Please enter why you are marking this claim as ${targetStatus}...`}
                value={reason}
                onChange={(e) => {
                  setErrorMsg('');
                  setReason(e.target.value);
                }}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium resize-none"
              />
            </div>
          )}



          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              id="status-update-modal-cancel"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-150 transition-colors"
            >
              Cancel
            </button>
            <button
              id="status-update-modal-confirm"
              type="submit"
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${theme.btnBg}`}
            >
              Confirm Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

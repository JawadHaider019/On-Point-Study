import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    primary: {
      headerBg: 'bg-gradient-to-r from-blue-700 to-indigo-800',
      btnBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm',
      icon: <CheckCircle2 className="w-5 h-5 text-blue-200" />,
    },
    success: {
      headerBg: 'bg-gradient-to-r from-emerald-700 to-teal-800',
      btnBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-200" />,
    },
    danger: {
      headerBg: 'bg-gradient-to-r from-rose-700 to-red-800',
      btnBg: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-sm',
      icon: <ShieldAlert className="w-5 h-5 text-rose-200" />,
    },
    warning: {
      headerBg: 'bg-gradient-to-r from-amber-600 to-orange-700',
      btnBg: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-sm',
      icon: <AlertCircle className="w-5 h-5 text-amber-200" />,
    },
  }[variant];

  return (
    <div
      id="confirm-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="confirm-modal-container"
        className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden text-slate-900"
      >
        {/* Header */}
        <div className={`p-4 px-5 text-white flex items-center justify-between ${variantStyles.headerBg}`}>
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md">
              {variantStyles.icon}
            </div>
            <h3 className="text-sm font-bold tracking-tight">{title}</h3>
          </div>
          <button
            id="confirm-modal-close-btn"
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-xs text-slate-600 space-y-3">
          <p className="leading-relaxed font-medium text-slate-700">{message}</p>
        </div>

        {/* Actions */}
        <div className="p-3.5 px-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            id="confirm-modal-cancel-btn"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            id="confirm-modal-action-btn"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all ${variantStyles.btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

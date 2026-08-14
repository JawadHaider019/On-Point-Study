import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { initialUsers } from '../../data/initialData';
import { X, ShieldCheck, UserCheck, CheckCircle2, LogIn, ArrowRight } from 'lucide-react';

export const SwitchUserModal = ({ isOpen, onClose }) => {
  const { currentUser, switchUser, addToast, setActiveTab } = useApp();

  if (!isOpen) return null;

  const handleSelectUser = (userId, userName, userRole) => {
    if (userId === currentUser.id) {
      onClose();
      return;
    }
    switchUser(userId);
    addToast(`Successfully logged in as ${userName} (${userRole})`, 'success');
    
    if (userRole !== 'ADMIN') {
      setActiveTab('claims');
    } else {
      setActiveTab('commission');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="switch-user-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Select User Account</h2>
              <p className="text-xs text-slate-500">Choose a profile to switch role and access rights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - User List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {initialUsers.map((user) => {
            const isCurrent = currentUser.id === user.id;
            const isAdmin = user.role === 'ADMIN';

            return (
              <div
                key={user.id}
                id={`switch-account-card-${user.id}`}
                onClick={() => handleSelectUser(user.id, user.name, user.role)}
                className={`group relative p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold ${
                        isAdmin ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                    >
                      {isAdmin ? 'A' : 'P'}
                    </span>
                  </div>

                  <div className="truncate space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{user.name}</h3>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <p className="text-[11px] font-medium text-slate-400 truncate">
                      {user.agentName || 'Finance & Operations'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      isAdmin
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}
                  >
                    {isAdmin ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    {user.role}
                  </span>

                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-400 transition-colors flex items-center justify-center">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/80 flex justify-between items-center text-xs text-slate-500">
          <span>Switching role updates navigation & permissions</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

    </div>
  );
};

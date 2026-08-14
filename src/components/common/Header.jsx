import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Check,
  ChevronDown,
} from 'lucide-react';
import { initialUsers } from '../../data/initialData';
import { ConfirmModal } from '../modals/ConfirmModal';

export const Header = ({ searchQuery, setSearchQuery }) => {
  const {
    activeTab,
    currentUser,
    switchUser,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const getTabTitle = (tab) => {
    switch (tab) {
      case 'dashboard':
        return 'DASHBOARD & ANALYTICS';
      case 'students':
        return 'STUDENT MANAGEMENT';
      case 'commission':
        return 'COMMISSION MANAGEMENT';
      case 'claims':
        return 'CLAIM SUBMISSIONS';
      case 'payments':
        return 'PAYMENTS & DISBURSEMENTS';
      case 'clawbacks':
        return 'CLAWBACK RESOLUTION';
      case 'admin-review':
        return 'ADMIN APPROVAL QUEUE';
      case 'agents':
        return 'AGENT NETWORK';
      case 'reports':
        return 'FINANCIAL REPORTS';
      case 'settings':
        return 'SETTINGS & PREFERENCES';
      default:
        return 'DASHBOARD & ANALYTICS';
    }
  };

  return (
    <header
      id="main-app-header"
      className="shrink-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs"
    >
      {/* Main Header Bar */}
      <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Page Title */}
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-black italic tracking-wide text-slate-900 uppercase font-sans">
            {getTabTitle(activeTab)}
          </h2>
        </div>

        {/* Right Section: User Profile */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* User Profile Badge */}
          <div className="relative">
            <button
              id="user-menu-toggle-btn"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
              }}
              className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all text-left"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-slate-300"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                    currentUser.role === 'ADMIN' ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                />
              </div>

              <div className="hidden lg:block">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {currentUser.role === 'ADMIN' ? 'Finance Admin' : currentUser.agentName}
                </div>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div
                id="user-profile-menu"
                className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 text-xs"
              >
                <div className="p-3 bg-slate-50 rounded-xl mb-2 border border-slate-100">
                  <div className="font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-slate-500 text-[11px] font-mono mt-0.5">{currentUser.email}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        currentUser.role === 'ADMIN'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {currentUser.role === 'ADMIN' ? 'Full Control' : currentUser.agentName}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Active User Demo
                  </div>
                  {initialUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        if (currentUser.id === u.id) {
                          setShowUserMenu(false);
                          return;
                        }
                        setConfirmConfig({
                          isOpen: true,
                          title: 'Confirm User Switch',
                          message: `Are you sure you want to switch active account to ${u.name} (${u.role})?`,
                          confirmText: 'Switch User',
                          variant: 'primary',
                          onConfirm: () => {
                            switchUser(u.id);
                            setShowUserMenu(false);
                            setConfirmConfig(null);
                          },
                        });
                      }}
                      className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                        currentUser.id === u.id
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                        <div>
                          <div>{u.name}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{u.role}</div>
                        </div>
                      </div>
                      {currentUser.id === u.id && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmConfig && confirmConfig.isOpen && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          variant={confirmConfig.variant}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}
    </header>
  );
};

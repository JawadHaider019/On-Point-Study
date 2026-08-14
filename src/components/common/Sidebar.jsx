import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Coins,
  FileCheck2,
  Receipt,
  ClipboardList,
  ShieldAlert,
  Building2,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Menu,
} from 'lucide-react';
import { ConfirmModal } from '../modals/ConfirmModal';

export const Sidebar = ({ isOpen, onToggle, onOpenSwitchUserModal }) => {
  const { currentUser, activeTab, setActiveTab, addToast } = useApp();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    addToast(`Logged out from ${currentUser.name}. Select an account to log back in.`, 'info');
    onOpenSwitchUserModal();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'commission', label: 'Commission Overview', icon: Coins, adminOnly: true },
    { id: 'claims', label: 'Claim Commission', icon: FileCheck2 },
    { id: 'payments', label: 'Payments & Invoices', icon: Receipt },
    // Admin only navigation items
    {
      id: 'admin-review',
      label: 'Admin Review Queue',
      icon: ClipboardList,
      adminOnly: true,
    },
    {
      id: 'clawbacks',
      label: 'Clawbacks',
      icon: ShieldAlert,
      adminOnly: true,
    },
    { id: 'agents', label: 'Partner Agents', icon: Building2, adminOnly: true },
    { id: 'reports', label: 'Financial Analytics', icon: BarChart3, adminOnly: true },
    { id: 'settings', label: 'Settings & Agreements', icon: Settings, adminOnly: true },
  ];

  if (!isOpen) {
    return (
      <aside
        id="main-sidebar-collapsed"
        className="w-16 bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 flex flex-col items-center py-4 shrink-0 text-white h-full overflow-y-auto select-none transition-all shadow-xl"
      >
        {/* Brand Logo & Expand Toggle */}
        <div className="flex flex-col items-center gap-3 mb-4 pb-4 border-b border-blue-700/60 w-full px-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-md shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <button
            id="sidebar-expand-btn"
            onClick={onToggle}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>

        {/* Collapsed Icon Navigation */}
        <nav className="flex-1 w-full px-2 space-y-2 flex flex-col items-center">
          {navItems.map((item) => {
            if (item.adminOnly && currentUser.role !== 'ADMIN') {
              return null;
            }

            const isDisabled = item.id !== 'commission' && item.id !== 'claims';
            if (isDisabled) {
              return null;
            }

            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-collapsed-${item.id}`}
                disabled={isDisabled}
                onClick={() => !isDisabled && setActiveTab(item.id)}
                title={isDisabled ? `${item.label} (Disabled)` : item.label}
                aria-label={item.label}
                className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all group ${isActive
                  ? 'bg-white text-blue-800 shadow-md scale-105'
                  : isDisabled
                    ? 'text-white/40 cursor-not-allowed opacity-40'
                    : 'text-white hover:bg-white/15'
                  }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-800' : 'text-white'
                    }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Collapsed Logout Button */}
        <div className="pt-3 border-t border-blue-700/60 w-full flex justify-center px-2">
          <button
            id="sidebar-collapsed-logout-btn"
            onClick={handleLogout}
            title={`Logout (${currentUser.name})`}
            aria-label="Logout"
            className="w-11 h-11 rounded-full bg-white text-blue-800 hover:bg-blue-50 transition-all flex items-center justify-center shadow-md"
          >
            <LogOut className="w-5 h-5 text-blue-800" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      id="main-sidebar"
      className="w-64 bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 flex flex-col shrink-0 text-white h-full overflow-hidden select-none transition-all shadow-xl border-r border-slate-800/80"
    >
      {/* Brand Logo & Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-md shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white uppercase leading-none">ON POINT</h1>
            <span className="text-[10px] font-bold text-blue-300 tracking-widest uppercase">STUDY PORTAL</span>
          </div>
        </div>
        <button
          id="sidebar-inner-close-btn"
          onClick={onToggle}
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 pr-3 py-4 space-y-2 overflow-y-auto pl-0">
        {navItems.map((item) => {
          if (item.adminOnly && currentUser.role !== 'ADMIN') {
            return null; // Enforce RBAC in navigation
          }

          const isDisabled = item.id !== 'commission' && item.id !== 'claims';
          if (isDisabled) {
            return null;
          }

          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              disabled={isDisabled}
              onClick={() => !isDisabled && setActiveTab(item.id)}
              className={`w-full flex items-center justify-between pl-5 pr-4 py-3 rounded-r-full rounded-l-none text-sm font-bold transition-all ${isActive
                ? 'bg-white text-blue-900 shadow-md'
                : isDisabled
                  ? 'text-white/40 cursor-not-allowed opacity-40'
                  : 'text-white hover:bg-white/10'
                }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon
                  className={`w-5 h-5 transition-colors shrink-0 ${isActive ? 'text-blue-800' : 'text-white'
                    }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Logout Pill */}
      <div className="p-4 border-t border-white/10 bg-slate-900/50">
        {/* Logout Pill Button */}
        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          title="Logout"
          className="w-full py-3 px-5 rounded-full bg-white hover:bg-blue-50 text-blue-900 font-extrabold text-sm transition-all flex items-center justify-between shadow-lg group"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-blue-800 group-hover:scale-110 transition-transform" />
            <span>Logout</span>
          </div>
        </button>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Confirm Logout / Account Switch"
        message={`Are you sure you want to log out from ${currentUser.name} (${currentUser.role})?`}
        confirmText="Logout"
        variant="warning"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </aside>
  );
};

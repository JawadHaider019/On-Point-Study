import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { SwitchUserModal } from './components/modals/SwitchUserModal';
import { ToastContainer } from './components/common/ToastContainer';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { RecentActivity } from './components/dashboard/RecentActivity';
import { MainCommissionTable } from './components/dashboard/MainCommissionTable';
import { AdminReviewView } from './components/views/AdminReviewView';
import { ClawbacksView } from './components/views/ClawbacksView';
import { ClaimsView } from './components/views/ClaimsView';
import { PaymentsView } from './components/views/PaymentsView';
import { AgentsView } from './components/views/AgentsView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';

function DashboardContent() {
  const { activeTab } = useApp();
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSwitchUserModalOpen, setIsSwitchUserModalOpen] = useState(false);

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          onOpenSwitchUserModal={() => setIsSwitchUserModalOpen(true)}
        />

        {/* Right Content Area with Top Header Bar */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header searchQuery={globalSearchQuery} setSearchQuery={setGlobalSearchQuery} />
          <main id="main-content-canvas" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Active View Router */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <SummaryCards />
                <RecentActivity />
              </div>
            )}

            {activeTab === 'students' && (
              <MainCommissionTable externalSearchQuery={globalSearchQuery} />
            )}

            {activeTab === 'commission' && (
              <MainCommissionTable externalSearchQuery={globalSearchQuery} />
            )}

            {activeTab === 'claims' && <ClaimsView />}

            {activeTab === 'payments' && <PaymentsView />}

            {activeTab === 'admin-review' && <AdminReviewView />}

            {activeTab === 'clawbacks' && <ClawbacksView />}

            {activeTab === 'agents' && <AgentsView />}

            {activeTab === 'reports' && <ReportsView />}

            {activeTab === 'settings' && <SettingsView />}
          </main>
        </div>
      </div>

      {/* Account / Role Selection Modal on Logout */}
      <SwitchUserModal
        isOpen={isSwitchUserModalOpen}
        onClose={() => setIsSwitchUserModalOpen(false)}
      />

      {/* Toast Feedback Messages */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}

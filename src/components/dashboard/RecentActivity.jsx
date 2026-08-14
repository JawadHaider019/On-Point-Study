import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const RecentActivity = () => {
  const { currentUser, auditLogs, notifications, claims, clawbacks, setActiveTab, setSelectedStudentId } = useApp();

  // Combine audit logs and notifications into a unified activity feed
  const activityItems = [
    ...notifications.map((n) => ({
      id: `notif-${n.id}`,
      title: n.title,
      description: n.message,
      timestamp: n.timestamp,
      type: n.type,
      studentId: n.linkStudentId,
      source: 'Notification',
    })),
    ...auditLogs.map((a) => ({
      id: `audit-${a.id}`,
      title: `${a.action} - ${a.studentId}`,
      description: `${a.performedBy} (${a.performedByRole}): ${a.reason || 'Status changed from ' + a.previousValue + ' to ' + a.newValue}`,
      timestamp: a.timestamp,
      type: a.newValue === 'Paid' ? 'success' : a.newValue === 'Clawback Requested' ? 'alert' : 'info',
      studentId: a.studentId,
      source: 'Audit Log',
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const pendingClaimsCount = claims.filter((c) => c.status === 'Under Review').length;
  const pendingClawbacksCount = clawbacks.filter((c) => c.status === 'Pending').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Activity Timeline Feed (2 cols) */}
      <div id="dashboard-recent-activity-feed" className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Activities & Updates</h2>
              <p className="text-xs text-slate-500">Real-time log of commission claims, approvals, and system events</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {activityItems.length} Events
          </span>
        </div>

        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {activityItems.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No recent activities recorded.</p>
          ) : (
            activityItems.map((item) => {
              let Icon = Clock;
              let bgColor = 'bg-blue-50 text-blue-600 border-blue-200';
              if (item.type === 'success') {
                Icon = CheckCircle2;
                bgColor = 'bg-emerald-50 text-emerald-600 border-emerald-200';
              } else if (item.type === 'alert') {
                Icon = AlertCircle;
                bgColor = 'bg-rose-50 text-rose-600 border-rose-200';
              } else if (item.type === 'warning') {
                Icon = ShieldAlert;
                bgColor = 'bg-amber-50 text-amber-600 border-amber-200';
              }

              const formattedDate = new Date(item.timestamp).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${bgColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                          {item.source}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-medium text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                    {formattedDate}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Action & System Health Sidebar (1 col) */}
      <div className="space-y-4">
        {/* Priority Pending Actions Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Live Monitor
            </h3>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold">
              Live Monitor
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Quickly jump to items requiring immediate approval or submission.
          </p>

          <div className="space-y-2.5">
            <button
              onClick={() => setActiveTab(currentUser.role === 'ADMIN' ? 'commission' : 'claims')}
              className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="text-xs font-bold text-white">Pending Claims</p>
                  <p className="text-[10px] text-slate-400">{pendingClaimsCount} awaiting review</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => setActiveTab('clawbacks')}
              className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <div>
                  <p className="text-xs font-bold text-white">Pending Clawbacks</p>
                  <p className="text-[10px] text-slate-400">{pendingClawbacksCount} pending resolution</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-xs font-bold text-white">View All Students</p>
                  <p className="text-[10px] text-slate-400">Track enrolments & fee stages</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        {/* Quick System Info Banner */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold border border-blue-200">
            GBP
          </div>
          <div>
            <h4 className="font-bold text-blue-950">UK Financial Compliance</h4>
            <p className="text-blue-700 text-[11px] mt-0.5 leading-relaxed">
              All commission payouts and claims are processed according to standard GBP university fee structures and audit rules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

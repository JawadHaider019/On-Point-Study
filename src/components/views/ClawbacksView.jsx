import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatGBP, formatDate } from '../../utils/formatters';
import { ShieldAlert, Plus, Search, Eye, AlertCircle } from 'lucide-react';
import { ClawbackModal } from '../modals/ClawbackModal';

export const ClawbacksView = () => {
  const { currentUser, clawbacks, agents, setSelectedStudentId } = useApp();
  const [selectedStudentForClawback, setSelectedStudentForClawback] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedAgent, setSelectedAgent] = useState('ALL');

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs">Clawback management is restricted to Finance Administrators.</p>
      </div>
    );
  }

  const filteredClawbacks = clawbacks.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const match =
        c.studentName.toLowerCase().includes(q) ||
        c.university.toLowerCase().includes(q) ||
        c.agentName.toLowerCase().includes(q) ||
        c.reason.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) {
      return false;
    }

    if (selectedAgent !== 'ALL' && c.agentName !== selectedAgent) {
      return false;
    }

    return true;
  });

  const totalClawbackValue = clawbacks.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div id="clawbacks-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <span>Commission Clawbacks Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track, audit, and issue financial clawback notices for withdrawn or non-eligible students.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] uppercase font-bold text-rose-600 block">
              Total Clawbacks Requested
            </span>
            <span className="text-lg font-extrabold text-rose-700">
              {formatGBP(totalClawbackValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="clawbacks-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clawbacks..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              id="clawback-status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none font-semibold text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Processed">Processed</option>
            </select>

            {/* Agent Filter */}
            <select
              id="clawback-agent-filter"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none font-semibold text-slate-700"
            >
              <option value="ALL">All Agency Partners</option>
              {Array.from(new Set(clawbacks.map((c) => c.agentName))).map((agentName) => (
                <option key={agentName} value={agentName}>
                  {agentName}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Showing {filteredClawbacks.length} clawback record(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Clawback ID</th>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Agent</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5">Requested By</th>
                <th className="p-3.5">Request Date</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredClawbacks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-500">
                    No clawback records found.
                  </td>
                </tr>
              ) : (
                filteredClawbacks.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{c.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {c.studentName}
                      <span className="block text-[10px] text-slate-400 font-normal">{c.university}</span>
                    </td>
                    <td className="p-3.5 text-slate-600">{c.agentName}</td>
                    <td className="p-3.5 font-extrabold text-rose-600">
                      {formatGBP(c.amount)}
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate italic">
                      "{c.reason}"
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">{c.requestedBy}</td>
                    <td className="p-3.5 text-slate-500">{formatDate(c.requestedAt)}</td>
                    <td className="p-3.5 text-right">
                      <button
                        id={`view-clawback-student-btn-${c.studentId}`}
                        onClick={() => setSelectedStudentId(c.studentId)}
                        className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-slate-100 to-blue-50 hover:from-slate-200 hover:to-blue-100 text-slate-800 font-bold text-xs transition-all inline-flex items-center gap-1 border border-slate-200 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudentForClawback && (
        <ClawbackModal
          studentId={selectedStudentForClawback}
          onClose={() => setSelectedStudentForClawback(null)}
        />
      )}
    </div>
  );
};

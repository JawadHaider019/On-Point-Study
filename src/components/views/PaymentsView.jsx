import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatGBP, formatDate } from '../../utils/formatters';
import { Receipt, Download, CheckCircle2, Search } from 'lucide-react';

export const PaymentsView = () => {
  const { currentUser, commissions, students, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all paid instalments
  const paidTransactions = [];

  commissions.forEach((c) => {
    const student = students.find((s) => s.id === c.studentId);
    if (!student) return;

    if (currentUser.role === 'AGENT' && student.agentName !== currentUser.agentName) {
      return;
    }

    c.instalments.forEach((inst) => {
      if (inst.status === 'Paid') {
        paidTransactions.push({
          studentId: student.id,
          studentName: student.name,
          university: student.university,
          agentName: student.agentName,
          instalmentLabel: inst.label,
          amount: inst.amount,
          paidAt: inst.paidAt || '2026-08-01T10:00:00Z',
        });
      }
    });
  });

  const filteredTransactions = paidTransactions.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.studentName.toLowerCase().includes(q) ||
      t.university.toLowerCase().includes(q) ||
      t.agentName.toLowerCase().includes(q)
    );
  });

  const totalDisbursed = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Student Name', 'University', 'Agent', 'Instalment', 'Amount (£)', 'Payment Date'];
    const rows = filteredTransactions.map((t) => [
      t.studentId,
      `"${t.studentName}"`,
      `"${t.university}"`,
      `"${t.agentName}"`,
      `"${t.instalmentLabel}"`,
      t.amount,
      formatDate(t.paidAt),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EduCommission_Payments_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Payment ledger exported to CSV successfully.', 'success');
  };

  return (
    <div id="payments-view" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-600" />
            <span>Payments & Invoices Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Reconciled bank transfers and completed commission disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Statement</span>
          </button>
        </div>
      </div>

      {/* Disbursed Metric Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-blue-800 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
            Total Commission Disbursed
          </span>
          <div className="text-2xl font-black">{formatGBP(totalDisbursed)}</div>
          <p className="text-xs text-blue-200">Across {filteredTransactions.length} completed transactions</p>
        </div>
        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
          <CheckCircle2 className="w-8 h-8 text-blue-300" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="payments-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search paid transactions..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {filteredTransactions.length} paid record(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Student ID</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">University</th>
                <th className="p-3.5">Agent</th>
                <th className="p-3.5">Instalment</th>
                <th className="p-3.5">Disbursed Amount</th>
                <th className="p-3.5">Payment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                    No paid transactions logged yet.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t, idx) => (
                  <tr key={`${t.studentId}-${idx}`} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{t.studentId}</td>
                    <td className="p-3.5 font-bold text-slate-900">{t.studentName}</td>
                    <td className="p-3.5 text-slate-600">{t.university}</td>
                    <td className="p-3.5 text-slate-600">{t.agentName}</td>
                    <td className="p-3.5 text-slate-500">{t.instalmentLabel}</td>
                    <td className="p-3.5 font-black text-emerald-700">{formatGBP(t.amount)}</td>
                    <td className="p-3.5 text-slate-500">{formatDate(t.paidAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatGBP } from '../../utils/formatters';
import { BarChart3, PieChart, TrendingUp, ShieldAlert } from 'lucide-react';

export const ReportsView = () => {
  const { currentUser, commissions, students } = useApp();

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs">Financial Analytics reports are restricted to Finance Administrators.</p>
      </div>
    );
  }

  // Calculate totals by Intake
  const intakeMap = {};
  commissions.forEach((c) => {
    const s = students.find((st) => st.id === c.studentId);
    if (!s) return;
    if (!intakeMap[s.intake]) {
      intakeMap[s.intake] = { total: 0, paid: 0, remaining: 0, count: 0 };
    }
    intakeMap[s.intake].total += c.totalCommission;
    intakeMap[s.intake].paid += c.paid;
    intakeMap[s.intake].remaining += c.remaining;
    intakeMap[s.intake].count += 1;
  });

  // Calculate totals by University
  const uniMap = {};
  commissions.forEach((c) => {
    const s = students.find((st) => st.id === c.studentId);
    if (!s) return;
    if (!uniMap[s.university]) {
      uniMap[s.university] = { total: 0, count: 0 };
    }
    uniMap[s.university].total += c.totalCommission;
    uniMap[s.university].count += 1;
  });

  const totalAgreed = commissions.reduce((sum, c) => sum + c.totalCommission, 0);

  return (
    <div id="reports-view" className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <span>Financial Analytics & Reports</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Commission distribution, intake performance, and university financial splits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report Card 1: Performance by Intake */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Commission by Intake Cohort</span>
            </h3>
            <span className="text-xs text-slate-400">Total Value</span>
          </div>

          <div className="space-y-4 pt-2">
            {Object.entries(intakeMap).map(([intake, data]) => {
              const pct = totalAgreed > 0 ? Math.round((data.total / totalAgreed) * 100) : 0;
              const paidPct = data.total > 0 ? Math.round((data.paid / data.total) * 100) : 0;

              return (
                <div key={intake} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800">{intake} ({data.count} students)</span>
                    <span className="text-slate-900">{formatGBP(data.total)} ({pct}%)</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex border border-slate-200">
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{ width: `${paidPct}%` }}
                      title={`Paid: ${formatGBP(data.paid)}`}
                    />
                    <div
                      className="bg-blue-500 h-full transition-all"
                      style={{ width: `${100 - paidPct}%` }}
                      title={`Remaining: ${formatGBP(data.remaining)}`}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span className="text-emerald-700 font-semibold">Paid: {formatGBP(data.paid)}</span>
                    <span className="text-blue-700 font-semibold">Remaining: {formatGBP(data.remaining)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Report Card 2: University Volume Splits */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              <span>University Share & Portfolio</span>
            </h3>
            <span className="text-xs text-slate-400">Total Agreed</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {Object.entries(uniMap).map(([uni, data]) => {
              const pct = totalAgreed > 0 ? Math.round((data.total / totalAgreed) * 100) : 0;
              return (
                <div key={uni} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{uni}</div>
                    <div className="text-[11px] text-slate-500">{data.count} student application(s)</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-slate-900">{formatGBP(data.total)}</div>
                    <div className="text-[10px] text-blue-600 font-semibold">{pct}% of portfolio</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

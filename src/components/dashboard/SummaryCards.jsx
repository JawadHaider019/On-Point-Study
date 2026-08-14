import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatGBP } from '../../utils/formatters';
import {
  Users,
  Coins,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export const SummaryCards = () => {
  const { currentUser, students, commissions } = useApp();

  // Filter students based on role
  const visibleStudents =
    currentUser.role === 'ADMIN'
      ? students
      : students.filter((s) => s.agentName === currentUser.agentName);

  const visibleStudentIds = new Set(visibleStudents.map((s) => s.id));
  const visibleCommissions = commissions.filter((c) => visibleStudentIds.has(c.studentId));

  const totalStudents = visibleStudents.length;

  const totalAgreedCommission = visibleCommissions.reduce((sum, c) => sum + c.totalCommission, 0);
  const totalPaid = visibleCommissions.reduce((sum, c) => sum + c.paid, 0);
  const totalRemaining = visibleCommissions.reduce((sum, c) => sum + c.remaining, 0);

  // Ready to Claim count and total amount
  const readyToClaimComms = visibleCommissions.filter((c) => c.status === 'Ready to Claim');
  const readyToClaimCount = readyToClaimComms.length;
  const readyToClaimAmount = readyToClaimComms.reduce((sum, c) => sum + c.totalCommission, 0);

  // In Progress / Under Review count and total amount
  const inProgressComms = visibleCommissions.filter(
    (c) => c.status === 'In Progress' || c.status === 'Under Review'
  );
  const inProgressCount = inProgressComms.length;

  const cards = [
    {
      id: 'card-total-students',
      label: 'Total Students',
      value: totalStudents.toString(),
      subtext: currentUser.role === 'ADMIN' ? 'Across all agents' : 'Assigned to your agency',
      icon: Users,
      color: 'from-blue-600 to-indigo-700',
      badge: `${totalStudents} Active`,
      badgeColor: 'bg-blue-100 text-blue-800 border border-blue-200 font-semibold',
    },
    {
      id: 'card-total-commission',
      label: 'Total Commission',
      value: formatGBP(totalAgreedCommission),
      subtext: 'Agreed contract value',
      icon: Coins,
      color: 'from-blue-700 to-slate-800',
      badge: '100% Contracted',
      badgeColor: 'bg-slate-100 text-slate-800 border border-slate-200 font-semibold',
    },
    {
      id: 'card-commission-paid',
      label: 'Commission Paid',
      value: formatGBP(totalPaid),
      subtext: `${totalAgreedCommission > 0 ? Math.round((totalPaid / totalAgreedCommission) * 100) : 0}% of total collected`,
      icon: CheckCircle2,
      color: 'from-emerald-600 to-teal-700',
      badge: 'Disbursed',
      badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold',
    },
    {
      id: 'card-commission-remaining',
      label: 'Commission Remaining',
      value: formatGBP(totalRemaining),
      subtext: 'Outstanding pipeline',
      icon: Clock,
      color: 'from-sky-600 to-blue-800',
      badge: 'Outstanding',
      badgeColor: 'bg-sky-100 text-sky-800 border border-sky-200 font-semibold',
    },
    {
      id: 'card-ready-to-claim',
      label: 'Ready to Claim',
      value: formatGBP(readyToClaimAmount),
      subtext: `${readyToClaimCount} student(s) eligible now`,
      icon: TrendingUp,
      color: 'from-blue-600 to-blue-800',
      badge: `${readyToClaimCount} Actionable`,
      badgeColor: 'bg-blue-100 text-blue-900 border border-blue-300 font-bold',
    },
    {
      id: 'card-in-progress',
      label: 'In Progress / Review',
      value: `${inProgressCount} Student(s)`,
      subtext: 'Pending course milestone or review',
      icon: AlertCircle,
      color: 'from-amber-600 to-orange-700',
      badge: 'In Pipeline',
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200 font-semibold',
    },
  ];

  return (
    <div id="summary-cards-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl text-white bg-gradient-to-br ${card.color} shadow-xs`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-1 mt-1">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                {card.value}
              </span>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium truncate">
                {card.subtext}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

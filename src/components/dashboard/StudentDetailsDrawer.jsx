import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatGBP, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import {
  X,
  User,
  GraduationCap,
  Building2,
  Coins,
  History,
  ShieldAlert,
  FileCheck2,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building,
  ArrowUpRight,
} from 'lucide-react';
import { ClaimModal } from '../modals/ClaimModal';
import { ClawbackModal } from '../modals/ClawbackModal';
import { AdjustCommissionModal } from '../modals/AdjustCommissionModal';

export const StudentDetailsDrawer = () => {
  const {
    currentUser,
    selectedStudentId,
    setSelectedStudentId,
    getStudentWithCommission,
    auditLogs,
    clawbacks,
    markPaymentPaid,
    approveClaim,
    claims,
  } = useApp();

  const [claimInstalmentNum, setClaimInstalmentNum] = useState(null);
  const [showClawbackModal, setShowClawbackModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [activeTab, setActiveTab] = useState('instalments');

  if (!selectedStudentId) return null;

  const data = getStudentWithCommission(selectedStudentId);
  if (!data || !data.student || !data.commission) return null;

  const { student, commission } = data;

  const studentLogs = auditLogs.filter((log) => log.studentId === student.id);
  const studentClawbacks = clawbacks.filter((clw) => clw.studentId === student.id);

  return (
    <div
      id="student-details-drawer-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
    >
      <div
        id="student-details-drawer-content"
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 text-slate-900 overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="p-5 bg-white text-slate-900 border-b border-slate-200 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 border border-blue-200 text-blue-800 font-mono font-bold text-sm">
              {student.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{student.name}</h2>
                <StatusBadge status={commission.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {student.university} • {student.course}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.role === 'ADMIN' && (
              <button
                id="drawer-adjust-comm-btn"
                onClick={() => setShowAdjustModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                <span>Adjust</span>
              </button>
            )}
            <button
              id="drawer-close-btn"
              onClick={() => setSelectedStudentId(null)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {/* Section 1: Student Information Grid */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Student & Academic Overview
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">University</span>
                <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{student.university}</span>
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Course</span>
                <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{student.course}</span>
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Intake</span>
                <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{student.intake}</span>
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Gross Fee</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {formatGBP(student.grossFee)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Net Fee</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {formatGBP(student.netFee)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-medium">Recruitment Partner</span>
                <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{student.agentName}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Commission Summary Financial Block */}
          <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-blue-900/50 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-sm">Commission Financial Summary</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 text-blue-200 font-mono font-medium border border-slate-700">
                Agreement: {commission.agreementType}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="p-3 rounded-xl bg-slate-955 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Total Agreed</span>
                <span className="text-lg font-extrabold text-white">{formatGBP(commission.totalCommission)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-955 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Paid Disbursed</span>
                <span className="text-lg font-extrabold text-emerald-400">{formatGBP(commission.paid)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-955 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Remaining Balance</span>
                <span className="text-lg font-extrabold text-blue-400">{formatGBP(commission.remaining)}</span>
              </div>
            </div>

            {/* Special Reason Banner (if status is Withdrawn, Not Eligible, or Clawback Requested) */}
            {commission.reason && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase text-[10px] tracking-wider block text-rose-300">
                    Reason / Special Note
                  </span>
                  <span>{commission.reason}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Navigation Tabs inside Drawer */}
          <div className="border-b border-slate-200 flex gap-4 text-xs font-semibold">
            <button
              id="drawer-tab-instalments"
              onClick={() => setActiveTab('instalments')}
              className={`pb-2 transition-colors relative ${
                activeTab === 'instalments'
                  ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Commission Details
            </button>

            {(studentClawbacks.length > 0 || currentUser.role === 'ADMIN') && (
              <button
                id="drawer-tab-clawback"
                onClick={() => setActiveTab('clawback')}
                className={`pb-2 transition-colors relative flex items-center gap-1.5 ${
                  activeTab === 'clawback'
                    ? 'text-rose-600 font-bold border-b-2 border-rose-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Clawback Details</span>
                {studentClawbacks.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px]">
                    {studentClawbacks.length}
                  </span>
                )}
              </button>
            )}

            <button
              id="drawer-tab-history"
              onClick={() => setActiveTab('history')}
              className={`pb-2 transition-colors relative ${
                activeTab === 'history'
                  ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Audit Trail ({studentLogs.length})
            </button>
          </div>

          {/* Tab Content 1: Commission Details Table */}
          {activeTab === 'instalments' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Commission Details</span>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Commission Claim</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      const matchingClaim = claims.find(
                        (c) => c.studentId === student.id
                      );

                      return (
                        <tr className="hover:bg-slate-50">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">
                              Full Program Commission
                            </div>
                            {commission.claimedAt && (
                              <div className="text-[10px] text-slate-400">Claimed: {formatDate(commission.claimedAt)}</div>
                            )}
                            {commission.paidAt && (
                              <div className="text-[10px] text-emerald-600 font-medium">Paid: {formatDate(commission.paidAt)}</div>
                            )}
                          </td>

                          <td className="p-3 font-extrabold text-slate-900">
                            {formatGBP(commission.totalCommission)}
                          </td>

                          <td className="p-3">
                            <StatusBadge status={commission.status} size="sm" />
                          </td>

                          <td className="p-3 text-right">
                            {/* Agent Action: Claim when Ready to Claim */}
                            {currentUser.role === 'AGENT' && commission.status === 'Ready to Claim' && (
                              <button
                                id={`claim-btn-commission`}
                                onClick={() => setClaimInstalmentNum(1)}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1 ml-auto"
                              >
                                <FileCheck2 className="w-3.5 h-3.5" />
                                <span>Claim</span>
                              </button>
                            )}

                            {/* Admin Action: Approve claim if Under Review */}
                            {currentUser.role === 'ADMIN' && commission.status === 'Under Review' && matchingClaim && (
                              <button
                                id={`admin-approve-commission`}
                                onClick={() => approveClaim(matchingClaim.id, 'Approved via drawer')}
                                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-all flex items-center gap-1 ml-auto"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}

                            {/* Admin Action: Mark Paid if Ready for Payment */}
                            {currentUser.role === 'ADMIN' && commission.status === 'Ready for Payment' && (
                              <button
                                id={`admin-paid-commission`}
                                onClick={() => markPaymentPaid(student.id)}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all flex items-center gap-1 ml-auto"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                <span>Mark Paid</span>
                              </button>
                            )}

                            {commission.status === 'Paid' && (
                              <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Content 2: Clawback Details (Admin / Recorded) */}
          {activeTab === 'clawback' && (
            <div className="space-y-4">
              {currentUser.role === 'ADMIN' && (
                <div className="flex items-center justify-between bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                  <div className="text-xs text-amber-900">
                    <span className="font-bold block">Admin Financial Action</span>
                    <span>Request a clawback for previously paid commission instalments.</span>
                  </div>
                  <button
                    id="drawer-init-clawback-btn"
                    onClick={() => setShowClawbackModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Request Clawback</span>
                  </button>
                </div>
              )}

              {studentClawbacks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-300 bg-white rounded-xl">
                  No active clawback requests for this student.
                </div>
              ) : (
                studentClawbacks.map((clw) => (
                  <div
                    key={clw.id}
                    className="bg-white text-slate-900 p-4 rounded-xl border border-slate-200 space-y-3 text-xs shadow-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-orange-600" />
                        <span className="font-bold">Clawback ID: {clw.id}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-300 text-[10px] font-bold">
                        {clw.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Clawback Amount</span>
                        <span className="text-sm font-bold text-rose-600">{formatGBP(clw.amount)}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Requested By</span>
                        <span className="font-semibold">{clw.requestedBy}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[11px] text-slate-400 block">Reason</span>
                        <p className="mt-0.5 text-slate-800 italic">{clw.reason}</p>
                      </div>
                      <div className="col-span-2 text-[10px] text-slate-400">
                        Request Date: {formatDate(clw.requestedAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab Content 3: Audit Trail Log */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <span>Audit & History Log</span>
              </div>

              {studentLogs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-300 bg-white rounded-xl">
                  No historical changes logged yet.
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-200 ml-3 pl-4 space-y-4 text-xs">
                  {studentLogs.map((log) => (
                    <div key={log.id} className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-xs">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{log.action}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {formatDate(log.timestamp)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          By <strong className="text-slate-800">{log.performedBy}</strong> ({log.performedByRole})
                        </div>
                        {log.previousValue && log.newValue && (
                          <div className="text-[11px] text-slate-600 font-mono mt-1">
                            {log.previousValue} → <strong className="text-blue-600">{log.newValue}</strong>
                          </div>
                        )}
                        {log.reason && (
                          <p className="text-[11px] text-slate-500 italic mt-1">
                            "{log.reason}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals rendered on top */}
      {claimInstalmentNum !== null && (
        <ClaimModal
          studentId={student.id}
          onClose={() => setClaimInstalmentNum(null)}
        />
      )}

      {showClawbackModal && (
        <ClawbackModal studentId={student.id} onClose={() => setShowClawbackModal(false)} />
      )}

      {showAdjustModal && (
        <AdjustCommissionModal studentId={student.id} onClose={() => setShowAdjustModal(false)} />
      )}
    </div>
  );
};

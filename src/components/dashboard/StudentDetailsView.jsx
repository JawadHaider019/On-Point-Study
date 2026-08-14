import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatGBP, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import {
  ChevronLeft,
  User,
  GraduationCap,
  Coins,
  History,
  ShieldAlert,
  FileCheck2,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building,
  Building2,
  CreditCard,
} from 'lucide-react';
import { ClaimModal } from '../modals/ClaimModal';
import { ClawbackModal } from '../modals/ClawbackModal';
import { AdjustCommissionModal } from '../modals/AdjustCommissionModal';
import { ConfirmModal } from '../modals/ConfirmModal';

export const StudentDetailsView = () => {
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

  const [activeTab, setActiveTab] = useState('student_info');
  const [claimInstalmentNum, setClaimInstalmentNum] = useState(null);
  const [showClawbackModal, setShowClawbackModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [confirmConfig, setConfirmConfig] = useState(null);

  if (!selectedStudentId) return null;

  const data = getStudentWithCommission(selectedStudentId);
  if (!data || !data.student || !data.commission) return null;

  const { student, commission } = data;

  const studentLogs = auditLogs.filter((log) => log.studentId === student.id);
  const filteredStudentLogs = studentLogs.filter((log) => {
    const q = auditSearch.toLowerCase().trim();
    if (q) {
      const match =
        log.action.toLowerCase().includes(q) ||
        log.performedBy.toLowerCase().includes(q) ||
        (log.reason && log.reason.toLowerCase().includes(q)) ||
        (log.previousValue && log.previousValue.toLowerCase().includes(q)) ||
        (log.newValue && log.newValue.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (auditActionFilter !== 'ALL' && log.action !== auditActionFilter) {
      return false;
    }
    return true;
  });
  const studentClawbacks = clawbacks.filter((clw) => clw.studentId === student.id);

  const menuItems = [
    { id: 'student_info', label: 'Student Information', icon: User },
    {
      id: 'instalments_schedule',
      label: 'Commission Details',
      icon: Calendar,
    },
    {
      id: 'clawback_details',
      label: 'Clawback Details',
      icon: ShieldAlert,
      count: studentClawbacks.length > 0 ? studentClawbacks.length : undefined,
    },
    {
      id: 'audit_trail',
      label: 'Audit Trail',
      icon: History,
      count: studentLogs.length > 0 ? studentLogs.length : undefined,
    },
  ];

  return (
    <div id="student-details-page-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Navigation & Student Title */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Top Row: Circular Back Button + Title & Status Badge + Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="back-to-list-btn"
              onClick={() => setSelectedStudentId(null)}
              className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 flex items-center justify-center transition-all shrink-0 shadow-2xs"
              title="Return to commission table"
            >
              <ChevronLeft className="w-5 h-5 text-slate-800" />
            </button>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">
                {student.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {student.university} • {student.course}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser.role === 'ADMIN' && (
              <button
                id="details-adjust-comm-btn"
                onClick={() => setShowAdjustModal(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-slate-100 to-blue-50 hover:from-slate-200 hover:to-blue-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-xs transition-all flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Adjust</span>
              </button>
            )}
            <StatusBadge status={commission.status} size="sm" />
          </div>
        </div>

        {/* Bottom Row: Pill ID Card & Date */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs shadow-2xs flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Student ID :</span>
            <span className="font-mono text-blue-700">{student.id.replace('STU-', '')}</span>
          </div>

          <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Intake: {student.intake}</span>
          </div>
        </div>
      </div>

      {/* Financial Overview Cards Row */}
      <div className="bg-gradient-to-r from-blue-50/70 via-slate-50/80 to-blue-50/70 border border-blue-100 rounded-2xl p-4 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
          {/* Card 1: Gross Tuition Fee */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:pl-3 first:pl-0">
            <div className="w-10 h-10 rounded-full bg-white border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
              <Coins className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Gross Tuition Fee</p>
              <p className="text-base font-black text-slate-900">{formatGBP(student.grossFee)}</p>
            </div>
          </div>

          {/* Card 2: Net Fee */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:pl-3">
            <div className="w-10 h-10 rounded-full bg-white border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
              <CreditCard className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Net Fee (Post-Scholarship)</p>
              <p className="text-base font-black text-slate-900">{formatGBP(student.netFee)}</p>
            </div>
          </div>

          {/* Card 3: Total Agreed Commission */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:pl-3">
            <div className="w-10 h-10 rounded-full bg-white border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
              <Coins className="w-5 h-5 text-blue-900" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Total Agreed Comm.</p>
              <p className="text-base font-black text-slate-900">{formatGBP(commission.totalCommission)}</p>
            </div>
          </div>

          {/* Card 4: Commission Paid */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:pl-3">
            <div className="w-10 h-10 rounded-full bg-white border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Commission Paid</p>
              <p className="text-base font-black text-emerald-700">{formatGBP(commission.paid)}</p>
            </div>
          </div>

          {/* Card 5: Remaining Balance */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:pl-3">
            <div className="w-10 h-10 rounded-full bg-white border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Remaining Balance</p>
              <p className="text-base font-black text-blue-700">{formatGBP(commission.remaining)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Toggle Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side Menu Vertical Navigation */}
        <div className="md:col-span-4 lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                id={`detail-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all text-xs font-bold text-left ${
                  isActive
                    ? 'bg-blue-50/60 text-blue-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {/* Active Left Pill Bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-700 rounded-r-full" />
                )}

                {/* Circle Icon Container */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <span className="flex-1 truncate">{item.label}</span>

                {item.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side Content Panel */}
        <div className="md:col-span-8 lg:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header Banner (Matches selected tab with Solid Accent Header) */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 text-white p-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeTab === 'student_info' && <User className="w-5 h-5 text-blue-300" />}
              {activeTab === 'instalments_schedule' && <Calendar className="w-5 h-5 text-blue-300" />}
              {activeTab === 'clawback_details' && <ShieldAlert className="w-5 h-5 text-rose-400" />}
              {activeTab === 'audit_trail' && <History className="w-5 h-5 text-blue-300" />}

              <h3 className="font-extrabold text-sm tracking-wide">
                {menuItems.find((m) => m.id === activeTab)?.label}
              </h3>
            </div>
          </div>

          {/* Section Body */}
          <div className="p-6">
            {/* 1. Student & Academic Information */}
            {activeTab === 'student_info' && (
              <div className="space-y-6 text-xs">
                {/* Personal Information Section */}
                <div>
                  <h4 className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Personal Details</span>
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-200/70 rounded-xl px-4 bg-slate-50/50">
                    <div className="py-3 grid grid-cols-3 items-center">
                      <span className="text-slate-500 font-semibold">Full Name</span>
                      <span className="col-span-2 font-bold text-slate-900 text-sm">{student.name}</span>
                    </div>

                    <div className="py-3 grid grid-cols-3 items-center">
                      <span className="text-slate-500 font-semibold">Student ID</span>
                      <span className="col-span-2 font-mono font-bold text-blue-700">
                        {student.id}
                      </span>
                    </div>

                    <div className="py-3 grid grid-cols-3 items-center">
                      <span className="text-slate-500 font-semibold">Email Address</span>
                      <span className="col-span-2 font-medium text-slate-800">
                        {student.name.toLowerCase().replace(/\s+/g, '.')}@student.edu
                      </span>
                    </div>

                    <div className="py-3 grid grid-cols-3 items-center">
                      <span className="text-slate-500 font-semibold">Recruitment Partner</span>
                      <span className="col-span-2 font-bold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>{student.agentName}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Academic Overview Section */}
                <div>
                  <h4 className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Academic Details</span>
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-200/70 rounded-xl px-4 bg-slate-50/50">
                    <div className="py-3 grid grid-cols-3 items-center">
                      <span className="text-slate-500 font-semibold">University</span>
                      <span className="col-span-2 font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                        <Building className="w-4 h-4 text-blue-600" />
                        <span>{student.university}</span>
                      </span>
                    </div>

                    <div className="py-3 grid grid-cols-3 items-center">
                      <span className="text-slate-500 font-semibold">Course Program</span>
                      <span className="col-span-2 font-bold text-slate-900 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        <span>{student.course}</span>
                      </span>
                    </div>

                    <div className="py-3 grid grid-cols-3 items-center">
                      <span className="text-slate-500 font-semibold">Intake Term</span>
                      <span className="col-span-2 font-bold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{student.intake}</span>
                      </span>
                    </div>

                    <div className="py-3 grid grid-cols-3 items-center">
                      <span className="text-slate-500 font-semibold">Enrollment Status</span>
                      <span className="col-span-2">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                          Enrolled & Verified
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Commission Details */}
            {activeTab === 'instalments_schedule' && (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Commission Claim</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(() => {
                        const matchingClaim = claims.find(
                          (c) => c.studentId === student.id
                        );

                        return (
                          <tr className="hover:bg-slate-50">
                            <td className="p-3.5">
                              <div className="font-bold text-slate-900">
                                Full Program Commission
                              </div>
                              {commission.claimedAt && (
                                <div className="text-[10px] text-slate-400">
                                  Claimed: {formatDate(commission.claimedAt)}
                                </div>
                              )}
                              {commission.paidAt && (
                                <div className="text-[10px] text-emerald-600 font-medium">
                                  Paid: {formatDate(commission.paidAt)}
                                </div>
                              )}
                            </td>

                            <td className="p-3.5 font-extrabold text-slate-900 text-sm">
                              {formatGBP(commission.totalCommission)}
                            </td>

                            <td className="p-3.5">
                              <StatusBadge status={commission.status} size="sm" />
                            </td>

                            <td className="p-3.5 text-right">
                              {/* Agent Action: Claim */}
                              {currentUser.role === 'AGENT' && commission.status === 'Ready to Claim' && (
                                <button
                                  id={`page-claim-btn-commission`}
                                  onClick={() => setClaimInstalmentNum(1)}
                                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 ml-auto"
                                >
                                  <FileCheck2 className="w-3.5 h-3.5" />
                                  <span>Claim</span>
                                </button>
                              )}

                              {/* Admin Action: Approve */}
                              {currentUser.role === 'ADMIN' &&
                                commission.status === 'Under Review' &&
                                matchingClaim && (
                                  <button
                                    id={`page-admin-approve-commission`}
                                    onClick={() =>
                                      setConfirmConfig({
                                        isOpen: true,
                                        title: 'Confirm Claim Approval',
                                        message: `Are you sure you want to approve the commission claim of ${formatGBP(commission.totalCommission)} for ${student.name}?`,
                                        confirmText: 'Approve Claim',
                                        variant: 'warning',
                                        onConfirm: () => {
                                          approveClaim(matchingClaim.id, 'Approved via page details');
                                          setConfirmConfig(null);
                                        },
                                      })
                                    }
                                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 ml-auto"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Approve Claim</span>
                                  </button>
                                )}

                              {/* Admin Action: Mark Paid */}
                              {currentUser.role === 'ADMIN' && commission.status === 'Ready for Payment' && (
                                <button
                                  id={`page-admin-paid-commission`}
                                  onClick={() =>
                                    setConfirmConfig({
                                      isOpen: true,
                                      title: 'Confirm Payment Disbursement',
                                      message: `Are you sure you want to mark commission of ${formatGBP(commission.totalCommission)} as Paid for ${student.name}? This will record the disbursement in the ledger.`,
                                      confirmText: 'Mark Paid',
                                      variant: 'success',
                                      onConfirm: () => {
                                        markPaymentPaid(student.id);
                                        setConfirmConfig(null);
                                      },
                                    })
                                  }
                                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 ml-auto"
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

            {/* 5. Clawback Details */}
            {activeTab === 'clawback_details' && (
              <div className="space-y-4">
                {currentUser.role === 'ADMIN' && (
                  <div className="flex items-center justify-between bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <div className="text-xs text-amber-900">
                      <span className="font-bold block">Admin Financial Action</span>
                      <span>Request a clawback for previously paid commission instalments.</span>
                    </div>
                    <button
                      id="page-init-clawback-btn"
                      onClick={() => setShowClawbackModal(true)}
                      className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Request Clawback</span>
                    </button>
                  </div>
                )}

                {studentClawbacks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-300 bg-white rounded-xl">
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
                        <span className="px-2.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-300 text-[10px] font-bold">
                          {clw.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-slate-700">
                        <div>
                          <span className="text-[11px] text-slate-400 block font-medium">
                            Clawback Amount
                          </span>
                          <span className="text-base font-black text-rose-600">
                            {formatGBP(clw.amount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block font-medium">
                            Requested By
                          </span>
                          <span className="font-semibold">{clw.requestedBy}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[11px] text-slate-400 block font-medium">
                            Reason
                          </span>
                          <p className="mt-0.5 text-slate-800 italic bg-slate-50 p-2 rounded border border-slate-200">
                            {clw.reason}
                          </p>
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

            {/* 6. Audit Trail */}
            {activeTab === 'audit_trail' && (
              <div className="space-y-4">
                {/* Audit Trail Filter Bar */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <input
                      id="audit-trail-search-input"
                      type="text"
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      placeholder="Filter audit logs..."
                      className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none max-w-xs"
                    />
                    <select
                      id="audit-action-filter"
                      value={auditActionFilter}
                      onChange={(e) => setAuditActionFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-700"
                    >
                      <option value="ALL">All Event Types</option>
                      {Array.from(new Set(studentLogs.map((l) => l.action))).map((action) => (
                        <option key={action} value={action}>
                          {action}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
                    Showing {filteredStudentLogs.length} of {studentLogs.length} event(s)
                  </span>
                </div>

                {filteredStudentLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-300 bg-white rounded-xl">
                    No matching audit logs found.
                  </div>
                ) : (
                  <div className="relative border-l-2 border-slate-200 ml-3 pl-4 space-y-4 text-xs pt-2">
                    {filteredStudentLogs.map((log) => (
                      <div key={log.id} className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 shadow-xs">
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>{log.action}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {formatDate(log.timestamp)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            By <strong className="text-slate-800">{log.performedBy}</strong> (
                            {log.performedByRole})
                          </div>
                          {log.previousValue && log.newValue && (
                            <div className="text-[11px] text-slate-600 font-mono mt-1 bg-slate-50 p-1.5 rounded">
                              {log.previousValue} →{' '}
                              <strong className="text-blue-600">{log.newValue}</strong>
                            </div>
                          )}
                          {log.reason && (
                            <p className="text-[11px] text-slate-500 italic mt-1">"{log.reason}"</p>
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
      </div>

      {/* Modals */}
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
    </div>
  );
};

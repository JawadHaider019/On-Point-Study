import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatGBP, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import {
  Search,
  ArrowUpDown,
  ChevronDown,
  X,
  Calendar,
  Building,
  UserCheck,
  Plus,
  Send,
  CheckCircle2,
  CreditCard,
  Clock,
  FileCheck2,
} from 'lucide-react';
import { CreateCommissionModal } from '../modals/CreateCommissionModal';

export const ClaimsView = () => {
  const {
    currentUser,
    claims,
    commissions,
    students,
    submitClaim,
    approveClaim,
    markPaymentPaid,
    updateStudentStatus,
  } = useApp();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedIntake, setSelectedIntake] = useState('ALL');
  const [selectedAgent, setSelectedAgent] = useState('ALL');
  const [selectedUniversity, setSelectedUniversity] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Combine explicit claims from state with any commission instalments that haven't been claimed yet
  const allClaims = useMemo(() => {
    const list = [];

    // Add existing explicit claims
    claims.forEach((c) => {
      const student = students.find((s) => s.id === c.studentId);
      list.push({
        ...c,
        intake: student?.intake || 'N/A',
      });
    });

    // Add instalments from commissions that don't have a claim record yet
    commissions.forEach((comm) => {
      const student = students.find((s) => s.id === comm.studentId);
      comm.instalments.forEach((inst) => {
        const exists = list.some(
          (c) => c.studentId === comm.studentId && c.instalmentNumber === inst.number
        );
        if (!exists) {
          list.push({
            id: `CLM-${comm.studentId}-${inst.number}`,
            instalmentId: inst.id,
            commissionId: comm.id,
            studentId: comm.studentId,
            studentName: student?.name || 'Unknown Student',
            university: student?.university || 'University',
            course: student?.course || 'Course',
            agentId: student?.agentId || 'AG-01',
            agentName: student?.agentName || 'Agent',
            instalmentNumber: inst.number,
            amount: inst.amount,
            submittedAt: comm.updatedAt || new Date().toISOString(),
            status: inst.status,
            notes: inst.label,
            intake: student?.intake || 'N/A',
          });
        }
      });
    });

    return list;
  }, [claims, commissions, students]);

  // RBAC Filter: Admin sees all, Agent sees theirs
  const baseClaims = useMemo(() => {
    if (currentUser.role === 'ADMIN') {
      return allClaims;
    }
    return allClaims.filter(
      (c) => c.agentName === currentUser.agentName
    );
  }, [currentUser, allClaims]);

  // Compute status counts for top status tab bar
  const statusCounts = useMemo(() => {
    const counts = {
      ALL: baseClaims.length,
      'Ready to Claim': 0,
      'Under Review': 0,
      'Ready for Payment': 0,
      Paid: 0,
      'Clawback Requested': 0,
    };

    baseClaims.forEach((c) => {
      if (counts[c.status] !== undefined) {
        counts[c.status] += 1;
      }
    });

    return counts;
  }, [baseClaims]);

  // Dropdown filter unique sets
  const uniqueIntakes = useMemo(() => Array.from(new Set(students.map((s) => s.intake))), [students]);
  const uniqueUniversities = useMemo(() => Array.from(new Set(students.map((s) => s.university))), [students]);
  const uniqueAgents = useMemo(() => Array.from(new Set(students.map((s) => s.agentName))), [students]);

  // Filter & Sort claims
  const filteredClaims = useMemo(() => {
    return baseClaims
      .filter((claim) => {
        // Search query
        const q = localSearch.toLowerCase().trim();
        if (q) {
          const matchName = claim.studentName.toLowerCase().includes(q);
          const matchId = claim.id.toLowerCase().includes(q) || claim.studentId.toLowerCase().includes(q);
          const matchUni = claim.university.toLowerCase().includes(q);
          const matchCourse = claim.course.toLowerCase().includes(q);
          if (!matchName && !matchId && !matchUni && !matchCourse) return false;
        }

        // Status tab
        if (selectedStatus !== 'ALL' && claim.status !== selectedStatus) {
          return false;
        }

        // Intake
        if (selectedIntake !== 'ALL' && claim.intake !== selectedIntake) {
          return false;
        }

        // University
        if (selectedUniversity !== 'ALL' && claim.university !== selectedUniversity) {
          return false;
        }

        // Agent
        if (currentUser.role === 'ADMIN' && selectedAgent !== 'ALL' && claim.agentName !== selectedAgent) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let res = 0;
        if (sortField === 'id') {
          res = a.id.localeCompare(b.id);
        } else if (sortField === 'name') {
          res = a.studentName.localeCompare(b.studentName);
        } else if (sortField === 'university') {
          res = a.university.localeCompare(b.university);
        } else if (sortField === 'intake') {
          res = (a.intake || '').localeCompare(b.intake || '');
        } else if (sortField === 'instalment') {
          res = a.instalmentNumber - b.instalmentNumber;
        } else if (sortField === 'amount') {
          res = a.amount - b.amount;
        } else if (sortField === 'date') {
          const timeA = new Date(a.submittedAt).getTime();
          const timeB = new Date(b.submittedAt).getTime();
          res = timeA - timeB;
        } else if (sortField === 'status') {
          res = a.status.localeCompare(b.status);
        }

        return sortOrder === 'asc' ? res : -res;
      });
  }, [
    baseClaims,
    localSearch,
    selectedStatus,
    selectedIntake,
    selectedUniversity,
    selectedAgent,
    currentUser,
    sortField,
    sortOrder,
  ]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const statusTabs = [
    { id: 'ALL', label: 'All Claims' },
    { id: 'Ready to Claim', label: 'Ready to Claim' },
    { id: 'Under Review', label: 'Under Review' },
    { id: 'Ready for Payment', label: 'Ready for Payment' },
    { id: 'Paid', label: 'Paid' },
    { id: 'Clawback Requested', label: 'Clawback / Disputed' },
  ];

  return (
    <div id="main-claims-page-layout" className="space-y-5">
      {/* 1. TOP HEADER BAR: Search Bar on Left, Filters on Right */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Bar (Left Side - Pill Style) */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="claims-search-input"
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by student, university, claim ID..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-100/90 border border-slate-200/80 rounded-full focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none font-medium text-slate-800 placeholder-slate-400 shadow-inner transition-all"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns (Right Side - Pill Buttons) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Intake Dropdown */}
          <div className="relative inline-flex items-center">
            <Calendar className="w-3.5 h-3.5 absolute left-3 text-blue-600 pointer-events-none" />
            <select
              id="claims-filter-intake-select"
              value={selectedIntake}
              onChange={(e) => setSelectedIntake(e.target.value)}
              className="pl-8 pr-7 py-2 text-xs bg-white border border-slate-300 rounded-full hover:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-800 font-bold shadow-xs appearance-none cursor-pointer transition-all"
            >
              <option value="ALL">All Intakes</option>
              {uniqueIntakes.map((intk) => (
                <option key={intk} value={intk}>
                  {intk}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 text-slate-400 pointer-events-none" />
          </div>

          {/* University Dropdown */}
          <div className="relative inline-flex items-center">
            <Building className="w-3.5 h-3.5 absolute left-3 text-blue-600 pointer-events-none" />
            <select
              id="claims-filter-university-select"
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="pl-8 pr-7 py-2 text-xs bg-white border border-slate-300 rounded-full hover:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-800 font-bold shadow-xs appearance-none cursor-pointer transition-all max-w-[170px] truncate"
            >
              <option value="ALL">All Universities</option>
              {uniqueUniversities.map((uni) => (
                <option key={uni} value={uni}>
                  {uni}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Agent Dropdown (Admin only) */}
          {currentUser.role === 'ADMIN' && (
            <div className="relative inline-flex items-center">
              <UserCheck className="w-3.5 h-3.5 absolute left-3 text-blue-600 pointer-events-none" />
              <select
                id="claims-filter-agent-select"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="pl-8 pr-7 py-2 text-xs bg-white border border-slate-300 rounded-full hover:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-800 font-bold shadow-xs appearance-none cursor-pointer transition-all max-w-[170px] truncate"
              >
                <option value="ALL">All Recruitment Partners</option>
                {uniqueAgents.map((ag) => (
                  <option key={ag} value={ag}>
                    {ag}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 text-slate-400 pointer-events-none" />
            </div>
          )}

          {/* Admin Create Commission Button */}
          {currentUser.role === 'ADMIN' && (
            <button
              id="claims-admin-create-commission-btn"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Commission</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MIDDLE TAB BAR: Connected Pill Container with Count Badges */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 p-1.5 rounded-full shadow-md overflow-x-auto flex items-center gap-1 no-scrollbar">
        {statusTabs.map((tab) => {
          const isActive = selectedStatus === tab.id;
          const count = statusCounts[tab.id] ?? 0;

          return (
            <button
              key={tab.id}
              id={`claims-tab-pill-${tab.id.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-white/20 text-white'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. SEPARATE TABLE CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="p-3.5">
                  <button
                    id="claims-sort-id-btn"
                    onClick={() => handleSort('id')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Claim ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>

                <th className="p-3.5">
                  <button
                    id="claims-sort-name-btn"
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Student Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>

                <th className="p-3.5">
                  <button
                    id="claims-sort-uni-btn"
                    onClick={() => handleSort('university')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Student Details</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>

                <th className="p-3.5">
                  <button
                    id="claims-sort-intake-btn"
                    onClick={() => handleSort('intake')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Intake</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>

                <th className="p-3.5">
                  <button
                    id="claims-sort-instalment-btn"
                    onClick={() => handleSort('instalment')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Instalment</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>

                <th className="p-3.5">
                  <button
                    id="claims-sort-amount-btn"
                    onClick={() => handleSort('amount')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>

                <th className="p-3.5">
                  <button
                    id="claims-sort-date-btn"
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Submitted / Updated</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>

                <th className="p-3.5">
                  <button
                    id="claims-sort-status-btn"
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>

                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-bold text-sm text-slate-700">
                        No matching claims found
                      </p>
                      <p className="text-xs">
                        Try modifying search queries or selecting a different tab.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* 1. Claim ID */}
                    <td className="p-3.5 font-mono font-bold text-slate-900">{claim.id}</td>

                    {/* 2. Student Name */}
                    <td className="p-3.5 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {claim.studentName}
                      {currentUser.role === 'ADMIN' && (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {claim.agentName}
                        </span>
                      )}
                    </td>

                    {/* 3. Student Details */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 leading-tight">{claim.university}</div>
                      <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{claim.course}</div>
                    </td>

                    {/* 4. Intake */}
                    <td className="p-3.5 font-semibold text-slate-700 whitespace-nowrap">
                      {claim.intake || 'N/A'}
                    </td>

                    {/* 5. Instalment */}
                    <td className="p-3.5 font-semibold text-slate-800">
                      Instalment #{claim.instalmentNumber}
                    </td>

                    {/* 6. Amount */}
                    <td className="p-3.5 font-extrabold text-slate-900">
                      {formatGBP(claim.amount)}
                    </td>

                    {/* 7. Submitted / Updated */}
                    <td className="p-3.5 text-slate-500 font-medium">
                      {formatDate(claim.submittedAt)}
                    </td>

                    {/* 8. Status */}
                    <td className="p-3.5">
                      <StatusBadge status={claim.status} size="sm" />
                    </td>

                    {/* 9. Actions */}
                    <td className="p-3.5 text-right">
                      {claim.status === 'Ready to Claim' && (
                        <button
                          id={`claims-submit-btn-${claim.id}`}
                          onClick={() => submitClaim(claim.studentId, claim.instalmentNumber)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Claim</span>
                        </button>
                      )}

                      {claim.status === 'Under Review' && (
                        currentUser.role === 'ADMIN' ? (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              id={`claims-approve-btn-${claim.id}`}
                              onClick={() => approveClaim(claim.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              id={`claims-reject-btn-${claim.id}`}
                              onClick={() => updateStudentStatus(claim.studentId, 'Not Eligible', 'Claim rejected by admin')}
                              className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-semibold text-xs inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Under Review
                          </span>
                        )
                      )}

                      {claim.status === 'Ready for Payment' && (
                        currentUser.role === 'ADMIN' ? (
                          <button
                            id={`claims-pay-btn-${claim.id}`}
                            onClick={() => markPaymentPaid(claim.studentId, claim.instalmentNumber)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Mark Paid</span>
                          </button>
                        ) : (
                          <span className="text-blue-600 font-semibold text-xs inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Approved
                          </span>
                        )
                      )}

                      {claim.status === 'Paid' && (
                        <span className="text-emerald-600 font-bold text-xs inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                        </span>
                      )}

                      {(claim.status === 'In Progress' || claim.status === 'Withdrawn' || claim.status === 'Not Eligible' || claim.status === 'Clawback Requested') && (
                        <span className="text-slate-400 text-xs italic">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateCommissionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatGBP, formatDate, getStatusStyle } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import {
  Plus,
  Send,
  CheckCircle2,
  CreditCard,
  Clock,
  FileCheck2,
} from 'lucide-react';
import { CreateCommissionModal } from '../modals/CreateCommissionModal';
import { ClaimStatusUpdateModal } from '../modals/ClaimStatusUpdateModal';

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
    updateClaimStatus,
  } = useApp();

  if (currentUser?.role === 'ADMIN') {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto my-12 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <FileCheck2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-2">Access Restructured</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The Commission Claims interface is reserved for partner agents. Admin users manage all claims and update statuses directly from the <strong>Commission Overview</strong> page.
        </p>
      </div>
    );
  }

  const [localSearch, setLocalSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedIntake, setSelectedIntake] = useState('ALL');
  const [selectedAgent, setSelectedAgent] = useState('ALL');
  const [selectedUniversity, setSelectedUniversity] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusModalConfig, setStatusModalConfig] = useState({
    isOpen: false,
    claim: null,
    targetStatus: '',
  });

  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Combine explicit claims from state with any commission that haven't been claimed yet
  const allClaims = useMemo(() => {
    const list = [];

    commissions.forEach((comm) => {
      const student = students.find((s) => s.id === comm.studentId);
      const claim = claims.find((c) => c.commissionId === comm.id);

      if (claim) {
        list.push({
          ...claim,
          intake: student?.intake || 'N/A',
        });
      } else {
        list.push({
          id: `CLM-${comm.id}`,
          commissionId: comm.id,
          studentId: comm.studentId,
          studentName: student?.name || 'Unknown Student',
          university: student?.university || 'University',
          course: student?.course || 'Course',
          agentId: student?.agentId || 'AG-01',
          agentName: student?.agentName || 'Agent',
          amount: comm.totalCommission,
          submittedAt: comm.updatedAt || new Date().toISOString(),
          status: comm.status,
          notes: comm.notes || student?.notes || '',
          intake: student?.intake || 'N/A',
        });
      }
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
          res = 0;
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

  const handleSelectStatus = (claim, newStatus) => {
    if (['Withdrawn', 'Not Eligible', 'Rejected', 'Paid'].includes(newStatus)) {
      setStatusModalConfig({
        isOpen: true,
        claim,
        targetStatus: newStatus,
      });
    } else {
      updateClaimStatus(claim.commissionId || claim.studentId, newStatus);
    }
  };

  const handleConfirmStatusUpdate = (reason, paidDate) => {
    if (statusModalConfig.claim) {
      updateClaimStatus(
        statusModalConfig.claim.commissionId || statusModalConfig.claim.studentId,
        statusModalConfig.targetStatus,
        reason,
        paidDate
      );
    }
    setStatusModalConfig({
      isOpen: false,
      claim: null,
      targetStatus: '',
    });
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
      <div className="flex flex-row items-center justify-between gap-3 w-full min-w-0">
        {/* Status Tabs pill bar */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 p-1 rounded-full flex flex-nowrap gap-0.5 shadow-inner items-center overflow-x-auto scrollbar-none border border-slate-800/80 min-w-0 flex-1 md:flex-initial">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.id;
            const count = statusCounts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-white text-blue-950 shadow-md font-extrabold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-all ${
                    isActive
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-black/35 text-white/95'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SEPARATE TABLE CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="p-3.5">Claim ID</th>

                <th className="p-3.5">Student Name</th>

                <th className="p-3.5">Student Details</th>

                <th className="p-3.5">Intake</th>



                <th className="p-3.5">Amount</th>

                <th className="p-3.5">Submitted / Updated</th>

                <th className="p-3.5">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
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



                    {/* 6. Amount */}
                    <td className="p-3.5 font-extrabold text-slate-900">
                      {formatGBP(claim.amount)}
                    </td>

                    {/* 7. Submitted / Updated */}
                    <td className="p-3.5 text-slate-500 font-medium">
                      {formatDate(claim.submittedAt)}
                    </td>

                    {/* 8. Status & Actions */}
                    <td className="p-3.5">
                      {currentUser.role === 'ADMIN' ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 animate-pulse ${
                              getStatusStyle(claim.status).dot
                            }`}
                          />
                          <select
                            value={claim.status}
                            onChange={(e) => handleSelectStatus(claim, e.target.value)}
                            className={`inline-flex items-center rounded-full border tracking-wide whitespace-nowrap transition-colors cursor-pointer px-3 py-1 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500/50 ${
                              getStatusStyle(claim.status).badge
                            }`}
                          >
                            <option value="Ready to Claim" className="bg-white text-slate-900 font-medium">Ready to Claim</option>
                            <option value="Under Review" className="bg-white text-slate-900 font-medium">Under Review</option>
                            <option value="Ready for Payment" className="bg-white text-slate-900 font-medium">Ready for Payment</option>
                            <option value="Paid" className="bg-white text-slate-900 font-medium">Paid</option>
                            <option value="Clawback Requested" className="bg-white text-slate-900 font-medium">Clawback Requested</option>
                            <option value="In Progress" className="bg-white text-slate-900 font-medium">In Progress</option>
                            <option value="Withdrawn" className="bg-white text-slate-900 font-medium">Withdrawn</option>
                            <option value="Not Eligible" className="bg-white text-slate-900 font-medium">Not Eligible</option>
                            <option value="Rejected" className="bg-white text-slate-900 font-medium">Rejected</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 items-start">
                          <StatusBadge status={claim.status} size="sm" />
                          {claim.status === 'Ready to Claim' && (
                            <button
                              id={`claims-submit-btn-${claim.id}`}
                              onClick={() => submitClaim(claim.studentId)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Submit Claim</span>
                            </button>
                          )}
                        </div>
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

      <ClaimStatusUpdateModal
        isOpen={statusModalConfig.isOpen}
        claim={statusModalConfig.claim}
        targetStatus={statusModalConfig.targetStatus}
        onClose={() => setStatusModalConfig({ isOpen: false, claim: null, targetStatus: '' })}
        onConfirm={handleConfirmStatusUpdate}
      />
    </div>
  );
};

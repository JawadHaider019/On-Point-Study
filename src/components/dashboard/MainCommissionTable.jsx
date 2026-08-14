import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatGBP, getStatusStyle } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { Plus } from 'lucide-react';
import { CreateCommissionModal } from '../modals/CreateCommissionModal';
import { ClaimStatusUpdateModal } from '../modals/ClaimStatusUpdateModal';

export const MainCommissionTable = ({ externalSearchQuery = '' }) => {
  const { currentUser, students, commissions, updateClaimStatus } = useApp();

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

  const [sortField, setSortField] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');

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

  const effectiveSearch = externalSearchQuery || localSearch;

  // Filter students by Agent RBAC
  const baseStudents = useMemo(() => {
    if (currentUser.role === 'ADMIN') {
      return students;
    }
    return students.filter(
      (s) => s.agentName === currentUser.agentName
    );
  }, [currentUser, students]);

  // Map students with their commissions
  const baseRows = useMemo(() => {
    return commissions.map((commission) => {
      const student = baseStudents.find((s) => s.id === commission.studentId);
      return { student, commission };
    }).filter((item) => item.student !== undefined);
  }, [baseStudents, commissions]);

  // Compute count badges for status tabs
  const statusCounts = useMemo(() => {
    const counts = {
      ALL: baseRows.length,
      'Ready to Claim': 0,
      'Under Review': 0,
      'Ready for Payment': 0,
      Paid: 0,
      'Clawback Requested': 0,
    };

    baseRows.forEach(({ commission }) => {
      if (commission && counts[commission.status] !== undefined) {
        counts[commission.status] += 1;
      }
    });

    return counts;
  }, [baseRows]);

  // Extract unique filter dropdown values
  const uniqueIntakes = useMemo(() => Array.from(new Set(students.map((s) => s.intake))), [students]);
  const uniqueUniversities = useMemo(() => Array.from(new Set(students.map((s) => s.university))), [students]);
  const uniqueAgents = useMemo(() => Array.from(new Set(students.map((s) => s.agentName))), [students]);

  // Combined filtered and sorted data list
  const filteredRows = useMemo(() => {
    return baseRows
      .filter(({ student, commission }) => {
        if (!commission) return false;

        // Search match
        const q = effectiveSearch.toLowerCase().trim();
        if (q) {
          const matchName = student.name.toLowerCase().includes(q);
          const matchId = student.id.toLowerCase().includes(q);
          const matchUni = student.university.toLowerCase().includes(q);
          const matchCourse = student.course.toLowerCase().includes(q);
          if (!matchName && !matchId && !matchUni && !matchCourse) return false;
        }

        // Status filter
        if (selectedStatus !== 'ALL' && commission.status !== selectedStatus) {
          return false;
        }

        // Intake filter
        if (selectedIntake !== 'ALL' && student.intake !== selectedIntake) {
          return false;
        }

        // University filter
        if (selectedUniversity !== 'ALL' && student.university !== selectedUniversity) {
          return false;
        }

        // Agent filter (Admin only)
        if (currentUser.role === 'ADMIN' && selectedAgent !== 'ALL' && student.agentName !== selectedAgent) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const commA = a.commission;
        const commB = b.commission;
        const studA = a.student;
        const studB = b.student;

        let res = 0;
        if (sortField === 'created') {
          res = commA.id.localeCompare(commB.id, undefined, { numeric: true });
        } else if (sortField === 'name') {
          res = studA.name.localeCompare(studB.name);
        } else if (sortField === 'intake') {
          res = studA.intake.localeCompare(studB.intake);
        } else if (sortField === 'totalCommission') {
          res = commA.totalCommission - commB.totalCommission;
        } else if (sortField === 'paid') {
          res = commA.paid - commB.paid;
        } else if (sortField === 'remaining') {
          res = commA.remaining - commB.remaining;
        } else if (sortField === 'status') {
          res = commA.status.localeCompare(commB.status);
        }

        return sortOrder === 'asc' ? res : -res;
      });
  }, [
    baseRows,
    effectiveSearch,
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

  const clearFilters = () => {
    setLocalSearch('');
    setSelectedStatus('ALL');
    setSelectedIntake('ALL');
    setSelectedAgent('ALL');
    setSelectedUniversity('ALL');
  };

  const hasActiveFilters =
    effectiveSearch ||
    selectedStatus !== 'ALL' ||
    selectedIntake !== 'ALL' ||
    selectedAgent !== 'ALL' ||
    selectedUniversity !== 'ALL';

  const statusTabs = [
    { id: 'ALL', label: 'All Commissions' },
    { id: 'Ready to Claim', label: 'Ready to Claim' },
    { id: 'Under Review', label: 'Under Review' },
    { id: 'Ready for Payment', label: 'Ready for Payment' },
    { id: 'Paid', label: 'Paid' },
    { id: 'Clawback Requested', label: 'Clawback / Disputed' },
  ];

  return (
    <div id="main-commission-page-layout" className="space-y-5">
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

        {currentUser.role === 'ADMIN' && (
          <button
            id="admin-create-commission-btn"
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Commission</span>
          </button>
        )}
      </div>

      {/* 3. SEPARATE TABLE CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="p-3.5">ID</th>

                <th className="p-3.5">Student Name</th>

                <th className="p-3.5">Student Details</th>

                <th className="p-3.5">Intake</th>

                <th className="p-3.5">Fees</th>

                <th className="p-3.5">Total Commission</th>

                <th className="p-3.5">Paid</th>

                <th className="p-3.5">Remaining</th>

                <th className="p-3.5">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-bold text-sm text-slate-700">
                        No matching commission records found
                      </p>
                      <p className="text-xs">
                        Try modifying search queries or selecting a different tab.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ student, commission }) => {
                  if (!commission) return null;

                  return (
                    <tr
                      key={commission.id}
                      id={`student-row-${commission.id}`}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* 1. ID */}
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {student.id.replace('STU-', '')}
                      </td>

                      {/* 2. Student Name */}
                      <td className="p-3.5 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {student.name}
                        {currentUser.role === 'ADMIN' && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {student.agentName}
                          </span>
                        )}
                      </td>

                      {/* 3. Student Details (University & Course) */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 leading-tight">
                          {student.university}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                          {student.course}
                        </div>
                      </td>

                      {/* 4. Intake */}
                      <td className="p-3.5 font-semibold text-slate-700 whitespace-nowrap">
                        {student.intake}
                      </td>

                      {/* 5. Fees (Gross & Net) */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 leading-tight">
                          Gross {formatGBP(student.grossFee)}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                          Net {formatGBP(student.netFee)}
                        </div>
                      </td>

                      {/* 6. Total Commission */}
                      <td className="p-3.5 font-extrabold text-slate-900">
                        {formatGBP(commission.totalCommission)}
                      </td>

                      {/* 7. Paid */}
                      <td className="p-3.5 font-extrabold text-emerald-700">
                        {formatGBP(commission.paid)}
                      </td>

                      {/* 8. Remaining */}
                      <td className="p-3.5 font-extrabold text-blue-600">
                        {formatGBP(commission.remaining)}
                      </td>

                      {/* 9. Status */}
                      <td className="p-3.5">
                        {currentUser.role === 'ADMIN' ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 animate-pulse ${
                                getStatusStyle(commission.status).dot
                              }`}
                            />
                            <select
                              value={commission.status}
                              onChange={(e) =>
                                handleSelectStatus(
                                  {
                                    studentId: student.id,
                                    studentName: student.name,
                                    university: student.university,
                                    amount: commission.totalCommission,
                                    commissionId: commission.id,
                                  },
                                  e.target.value
                                )
                              }
                              className={`inline-flex items-center rounded-full border tracking-wide whitespace-nowrap transition-colors cursor-pointer px-3 py-1 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500/50 ${
                                getStatusStyle(commission.status).badge
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
                          <StatusBadge status={commission.status} size="sm" />
                        )}
                      </td>
                    </tr>
                  );
                })
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

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatGBP } from '../../utils/formatters';
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
} from 'lucide-react';
import { CreateCommissionModal } from '../modals/CreateCommissionModal';

export const MainCommissionTable = ({ externalSearchQuery = '' }) => {
  const { currentUser, students, commissions } = useApp();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedIntake, setSelectedIntake] = useState('ALL');
  const [selectedAgent, setSelectedAgent] = useState('ALL');
  const [selectedUniversity, setSelectedUniversity] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [sortField, setSortField] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');

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
    return baseStudents.map((student) => {
      const commission = commissions.find((c) => c.studentId === student.id);
      return { student, commission };
    }).filter((item) => item.commission !== undefined);
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
          const timeA = commA.updatedAt ? new Date(commA.updatedAt).getTime() : 0;
          const timeB = commB.updatedAt ? new Date(commB.updatedAt).getTime() : 0;
          res = timeA - timeB;
          if (res === 0) {
            res = commA.id.localeCompare(commB.id, undefined, { numeric: true });
          }
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
      {/* 1. TOP HEADER BAR: Search Bar on Left, Filters on Right */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Bar (Left Side - Pill Style) */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="table-search-input"
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by student, university, course..."
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
              id="filter-intake-select"
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
              id="filter-university-select"
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
                id="filter-agent-select"
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
              id="admin-create-commission-btn"
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
              id={`tab-pill-${tab.id.toLowerCase().replace(/\s+/g, '-')}`}
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
                    id="sort-created-btn"
                    onClick={() => handleSort('created')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>

                <th className="p-3.5">
                  <button
                    id="sort-name-btn"
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Student Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>

                <th className="p-3.5">Student Details</th>

                <th className="p-3.5">
                  <button
                    id="sort-intake-btn"
                    onClick={() => handleSort('intake')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Intake</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>

                <th className="p-3.5">Fees</th>

                <th className="p-3.5">
                  <button
                    id="sort-total-comm-btn"
                    onClick={() => handleSort('totalCommission')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Total Commission</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>

                <th className="p-3.5">
                  <button
                    id="sort-paid-btn"
                    onClick={() => handleSort('paid')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Paid</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>

                <th className="p-3.5">
                  <button
                    id="sort-remaining-btn"
                    onClick={() => handleSort('remaining')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Remaining</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>

                <th className="p-3.5">
                  <button
                    id="sort-status-btn"
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                  >
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
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
                      key={student.id}
                      id={`student-row-${student.id}`}
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
                        <StatusBadge status={commission.status} size="sm" />
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
    </div>
  );
};

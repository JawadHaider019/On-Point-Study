import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatGBP } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import {
  Building2,
  Mail,
  MapPin,
  Users,
  Coins,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Search,
  Eye,
  GraduationCap,
  FileText,
  Briefcase,
} from 'lucide-react';

export const AgentsView = () => {
  const { currentUser, agents, students, commissions, setSelectedStudentId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAgentId, setExpandedAgentId] = useState(null);

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs">Partner Agent directory is restricted to Finance Administrators.</p>
      </div>
    );
  }

  const toggleExpand = (agentId) => {
    setExpandedAgentId((prev) => (prev === agentId ? null : agentId));
  };

  const filteredAgents = agents.filter((ag) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    const matchAgent = ag.name.toLowerCase().includes(q) || ag.location.toLowerCase().includes(q) || ag.contactEmail.toLowerCase().includes(q);
    const agentStudents = students.filter((s) => s.agentId === ag.id || s.agentName === ag.name);
    const matchStudent = agentStudents.some((s) => s.name.toLowerCase().includes(q) || s.university.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    return matchAgent || matchStudent;
  });

  return (
    <div id="agents-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Partner Recruitment Agencies</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Registered education partner agencies and their recruited student rosters.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-partners-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search partners or students..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Partners</span>
            <span className="text-xl font-black text-slate-900">{agents.length} Active Agencies</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Recruited Students</span>
            <span className="text-xl font-black text-slate-900">{students.length} Enrolled</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Commissions Disbursed</span>
            <span className="text-xl font-black text-emerald-700">
              {formatGBP(agents.reduce((acc, a) => acc + a.totalEarned, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Partner Agencies List */}
      <div className="space-y-4">
        {filteredAgents.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
            No partner recruitment agencies found matching "{searchQuery}".
          </div>
        ) : (
          filteredAgents.map((ag) => {
            const isExpanded = expandedAgentId === ag.id;
            const partnerStudents = students.filter(
              (s) => s.agentId === ag.id || s.agentName === ag.name
            );

            return (
              <div
                key={ag.id}
                id={`agent-card-${ag.id}`}
                className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all"
              >
                {/* Agency Header Card */}
                <div className="p-5 flex flex-wrap items-center justify-between gap-4 bg-white border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{ag.name}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {ag.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ag.location}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`mailto:${ag.contactEmail}`} className="text-blue-600 hover:underline font-medium">
                            {ag.contactEmail}
                          </a>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Agency Quick Stats & Expand Action */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Students</span>
                        <span className="font-bold text-slate-900 text-sm">{partnerStudents.length}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Earned</span>
                        <span className="font-extrabold text-emerald-700 text-sm">{formatGBP(ag.totalEarned)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Claims</span>
                        <span className="font-bold text-amber-600 text-sm">{ag.pendingClaims}</span>
                      </div>
                    </div>

                    <button
                      id={`toggle-agent-students-${ag.id}`}
                      onClick={() => toggleExpand(ag.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isExpanded
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md'
                          : 'bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100 text-slate-700 border-slate-200 shadow-xs'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>{isExpanded ? 'Hide Students' : `View Students (${partnerStudents.length})`}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Recruited Students List */}
                {isExpanded && (
                  <div className="bg-slate-50/70 p-4 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        <span>Recruited Student Roster ({partnerStudents.length})</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        Click 'Details' to inspect agreement and commission claims
                      </span>
                    </div>

                    {partnerStudents.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
                        No students currently registered under {ag.name}.
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                              <tr>
                                <th className="p-3">Student ID</th>
                                <th className="p-3">Student Name</th>
                                <th className="p-3">University & Course</th>
                                <th className="p-3">Intake</th>
                                <th className="p-3">Enrolment</th>
                                <th className="p-3">Commission Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {partnerStudents.map((st) => {
                                const comm = commissions.find((c) => c.studentId === st.id);
                                return (
                                  <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-3 font-mono font-bold text-slate-900">{st.id}</td>
                                    <td className="p-3">
                                      <div className="font-bold text-slate-900">{st.name}</div>
                                    </td>
                                    <td className="p-3">
                                      <div className="font-semibold text-slate-800">{st.university}</div>
                                      <div className="text-[11px] text-slate-500">{st.course}</div>
                                    </td>
                                    <td className="p-3 text-slate-600">{st.intake}</td>
                                    <td className="p-3">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                          st.enrolmentStatus === 'Enrolled'
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                            : st.enrolmentStatus === 'Withdrawn'
                                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                                            : st.enrolmentStatus === 'Completed'
                                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                                            : 'bg-amber-50 text-amber-800 border-amber-200'
                                        }`}
                                      >
                                        {st.enrolmentStatus}
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      {comm ? (
                                        <div className="flex items-center gap-2">
                                          <StatusBadge status={comm.status} size="sm" />
                                          <span className="text-[11px] font-bold text-slate-600">
                                            {formatGBP(comm.totalCommission)}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-slate-400 italic text-[11px]">No agreement</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

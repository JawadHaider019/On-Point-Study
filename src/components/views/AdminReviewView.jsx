import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatGBP, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { ClipboardList, CheckCircle2, SlidersHorizontal, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { AdjustCommissionModal } from '../modals/AdjustCommissionModal';
import { ConfirmModal } from '../modals/ConfirmModal';

export const AdminReviewView = () => {
  const { currentUser, claims, commissions, students, approveClaim, setSelectedStudentId } = useApp();
  const [selectedAdjustStudentId, setSelectedAdjustStudentId] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs">Admin review queue is restricted to Finance Administrators.</p>
      </div>
    );
  }

  const pendingClaims = claims.filter((c) => c.status === 'Under Review');
  const pastReviewedClaims = claims.filter((c) => c.status !== 'Under Review');

  return (
    <div id="admin-review-view" className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            <span>Admin Commission Claims Review</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review agent claims, verify eligibility, approve payouts, or adjust figures.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200">
          {pendingClaims.length} Pending Approval
        </span>
      </div>

      {/* Pending Claims Queue */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 bg-blue-50/50 border-b border-slate-200 font-bold text-xs text-blue-900">
          Claims Awaiting Review ({pendingClaims.length})
        </div>

        {pendingClaims.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">All claims reviewed!</p>
            <p className="text-slate-400">There are currently no pending claims waiting for admin review.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {pendingClaims.map((claim) => {
              const comm = commissions.find((c) => c.studentId === claim.studentId);
              const stud = students.find((s) => s.id === claim.studentId);

              return (
                <div
                  key={claim.id}
                  id={`review-claim-item-${claim.id}`}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {claim.studentId}
                      </span>
                      <span className="font-bold text-base text-slate-900">
                        {claim.studentName}
                      </span>
                      <StatusBadge status={claim.status} size="sm" />
                    </div>

                    <div className="text-slate-600 font-medium">
                      {claim.university} • {claim.course}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span>Agent: <strong className="text-slate-800">{claim.agentName}</strong></span>
                      <span>Instalment: <strong className="text-slate-800">#{claim.instalmentNumber}</strong></span>
                      <span>Submitted: <strong className="text-slate-800">{formatDate(claim.submittedAt)}</strong></span>
                    </div>

                    {comm && (
                      <div className="flex items-center gap-3 pt-2 text-slate-600">
                        <span className="bg-slate-100 px-2 py-1 rounded">
                          Claimed Amount: <strong className="text-blue-600">{formatGBP(claim.amount)}</strong>
                        </span>
                        <span className="bg-slate-100 px-2 py-1 rounded">
                          Total Comm: <strong>{formatGBP(comm.totalCommission)}</strong>
                        </span>
                        <span className="bg-slate-100 px-2 py-1 rounded">
                          Paid: <strong>{formatGBP(comm.paid)}</strong>
                        </span>
                        <span className="bg-slate-100 px-2 py-1 rounded">
                          Remaining: <strong>{formatGBP(comm.remaining)}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                    <button
                      id={`review-adjust-btn-${claim.id}`}
                      onClick={() => setSelectedAdjustStudentId(claim.studentId)}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-slate-100 to-blue-50 hover:from-slate-200 hover:to-blue-100 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5 border border-slate-200 shadow-xs"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                      <span>Adjust</span>
                    </button>

                    <button
                      id={`review-inspect-btn-${claim.id}`}
                      onClick={() => setSelectedStudentId(claim.studentId)}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-800 font-bold text-xs transition-all border border-slate-200 shadow-xs"
                    >
                      View Record
                    </button>

                    <button
                      id={`review-approve-btn-${claim.id}`}
                      onClick={() =>
                        setConfirmConfig({
                          isOpen: true,
                          title: 'Confirm Claim Approval',
                          message: `Are you sure you want to approve the claim for ${claim.studentName} (Instalment #${claim.instalmentNumber} - ${formatGBP(claim.amount)})?`,
                          confirmText: 'Approve Claim',
                          variant: 'warning',
                          onConfirm: () => {
                            approveClaim(claim.id, 'Claim approved by Finance Admin');
                            setConfirmConfig(null);
                          },
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Claim</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Previously Reviewed Claims History */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-xs text-slate-700">
          Reviewed Claims History ({pastReviewedClaims.length})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Claim ID</th>
                <th className="p-3">Student</th>
                <th className="p-3">Agent</th>
                <th className="p-3">Instalment</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Reviewed Date</th>
                <th className="p-3">Reviewed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {pastReviewedClaims.map((cl) => (
                <tr key={cl.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold">{cl.id}</td>
                  <td className="p-3 font-bold">{cl.studentName}</td>
                  <td className="p-3 text-slate-500">{cl.agentName}</td>
                  <td className="p-3">#{cl.instalmentNumber}</td>
                  <td className="p-3 font-extrabold text-slate-900">
                    {formatGBP(cl.amount)}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={cl.status} size="sm" />
                  </td>
                  <td className="p-3 text-slate-500">{formatDate(cl.reviewedAt || cl.submittedAt)}</td>
                  <td className="p-3 font-semibold text-slate-700">
                    {cl.reviewedBy || 'Admin'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAdjustStudentId && (
        <AdjustCommissionModal
          studentId={selectedAdjustStudentId}
          onClose={() => setSelectedAdjustStudentId(null)}
        />
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

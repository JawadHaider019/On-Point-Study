import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialUsers,
  initialStudents,
  initialCommissions,
  initialClaims,
  initialClawbacks,
  initialAuditLogs,
  initialNotifications,
  initialAgents,
} from '../data/initialData';

const STORAGE_KEYS = {
  USER: 'comm_app_user',
  STUDENTS: 'comm_app_students',
  COMMISSIONS: 'comm_app_commissions',
  CLAIMS: 'comm_app_claims',
  CLAWBACKS: 'comm_app_clawbacks',
  AUDIT_LOGS: 'comm_app_audit_logs',
  NOTIFICATIONS: 'comm_app_notifications',
};

const getStorageItem = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Sanitize commissions to eliminate duplicate IDs from previous runs
      if (key === STORAGE_KEYS.COMMISSIONS && Array.isArray(parsed)) {
        const seen = new Set();
        let maxId = parsed.reduce((max, c) => {
          const num = parseInt(c.id.replace(/\D/g, ''), 10);
          return !isNaN(num) && num > max ? num : max;
        }, 8);
        return parsed.map((c) => {
          if (!c.id || seen.has(c.id)) {
            maxId += 1;
            c.id = `COMM-${String(maxId).padStart(3, '0')}`;
          }
          seen.add(c.id);
          return c;
        });
      }
      // Sanitize claims to eliminate duplicate IDs from previous runs
      if (key === STORAGE_KEYS.CLAIMS && Array.isArray(parsed)) {
        const seen = new Set();
        return parsed.map((cl) => {
          if (!cl.id || seen.has(cl.id)) {
            cl.id = `CLM-${cl.commissionId || Date.now()}`;
          }
          seen.add(cl.id);
          return cl;
        });
      }
      return parsed;
    }
  } catch (err) {
    console.error(`Error loading ${key} from localStorage:`, err);
  }
  return defaultValue;
};

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => getStorageItem(STORAGE_KEYS.USER, initialUsers[0]));
  const [students, setStudents] = useState(() => getStorageItem(STORAGE_KEYS.STUDENTS, initialStudents));
  const [commissions, setCommissions] = useState(() => getStorageItem(STORAGE_KEYS.COMMISSIONS, initialCommissions));
  const [claims, setClaims] = useState(() => getStorageItem(STORAGE_KEYS.CLAIMS, initialClaims));
  const [clawbacks, setClawbacks] = useState(() => getStorageItem(STORAGE_KEYS.CLAWBACKS, initialClawbacks));
  const [auditLogs, setAuditLogs] = useState(() => getStorageItem(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs));
  const [notifications, setNotifications] = useState(() => getStorageItem(STORAGE_KEYS.NOTIFICATIONS, initialNotifications));
  const [agents] = useState(initialAgents);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    const user = getStorageItem(STORAGE_KEYS.USER, initialUsers[0]);
    return user && user.role === 'ADMIN' ? 'commission' : 'claims';
  });
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMMISSIONS, JSON.stringify(commissions));
  }, [commissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLAWBACKS, JSON.stringify(clawbacks));
  }, [clawbacks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  const addToast = (message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchUser = (userId) => {
    const target = initialUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      addToast(`Switched user role to ${target.name} (${target.role})`, 'info');
      // Reset tab if Agent switches away from admin-only tab or Admin switches away from agent-only tab
      if (target.role === 'AGENT' && ['commission', 'admin-review', 'clawbacks', 'agents', 'reports'].includes(activeTab)) {
        setActiveTab('claims');
      } else if (target.role === 'ADMIN' && activeTab === 'claims') {
        setActiveTab('commission');
      }
    }
  };

  const addAuditLog = (studentId, action, prevVal, newVal, reason) => {
    const log = {
      id: `AUD-${Date.now()}`,
      studentId,
      performedBy: currentUser.name,
      performedByRole: currentUser.role,
      action,
      previousValue: prevVal,
      newValue: newVal,
      timestamp: new Date().toISOString(),
      reason,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const addNotification = (title, message, type, linkStudentId) => {
    const notif = {
      id: `NOTIF-${Date.now()}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      type,
      read: false,
      linkStudentId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const getStudentWithCommission = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    const commission = commissions.find((c) => c.studentId === studentId);
    if (!student && !commission) return null;
    return { student, commission };
  };

  // Helper to recalculate overall commission status
  const calculateOverallStatus = (comm) => {
    return comm.status || 'In Progress';
  };

  // 0. Create Commission (Admin action)
  const createCommission = (payload) => {
    const existingStudent = payload.studentId
      ? students.find((s) => s.id === payload.studentId)
      : students.find((s) => s.name === payload.studentName);

    const maxStudentIdNum = students.reduce((max, s) => {
      const num = parseInt(s.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const targetStudentId = existingStudent ? existingStudent.id : `STU-${String(maxStudentIdNum + 1).padStart(3, '0')}`;

    const maxCommIdNum = commissions.reduce((max, c) => {
      const num = parseInt(c.id.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newCommissionId = `COMM-${String(maxCommIdNum + 1).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();

    const initialStatus = payload.status || 'Ready to Claim';

    const newCommission = {
      id: newCommissionId,
      studentId: targetStudentId,
      totalCommission: payload.totalCommission,
      paid: 0,
      remaining: payload.totalCommission,
      status: initialStatus,
      updatedAt: nowIso,
    };

    if (existingStudent) {
      setStudents((prev) =>
        prev.map((s) => (s.id === existingStudent.id ? { ...s, commissionId: newCommissionId } : s))
      );
      setCommissions((prev) => [newCommission, ...prev]);
    } else {
      const newStudent = {
        id: targetStudentId,
        name: payload.studentName,
        university: payload.university || 'Partner University',
        course: payload.course || 'Standard Program',
        intake: payload.intake || 'September 2026',
        grossFee: payload.grossFee || 15000,
        netFee: payload.grossFee || 15000,
        agentId: payload.agentId || 'agent_001',
        agentName: payload.agentName || 'Global Education Partners',
        commissionId: newCommissionId,
        enrolmentStatus: 'Enrolled',
      };
      setStudents((prev) => [newStudent, ...prev]);
      setCommissions((prev) => [newCommission, ...prev]);
    }

    // Auto-create claim record if not Ready to Claim
    if (initialStatus !== 'Ready to Claim') {
      const initialClaim = {
        id: `CLM-${newCommissionId}`,
        commissionId: newCommissionId,
        studentId: targetStudentId,
        studentName: payload.studentName || (existingStudent ? existingStudent.name : 'Unknown Student'),
        university: payload.university || (existingStudent ? existingStudent.university : 'Partner University'),
        course: payload.course || (existingStudent ? existingStudent.course : 'Standard Program'),
        agentId: payload.agentId || (existingStudent ? existingStudent.agentId : 'agent_001'),
        agentName: payload.agentName || (existingStudent ? existingStudent.agentName : 'Global Education Partners'),
        amount: payload.totalCommission,
        submittedAt: nowIso,
        status: initialStatus,
        notes: `Commission created with status ${initialStatus}`,
      };
      setClaims((prev) => [initialClaim, ...prev.filter((c) => c.commissionId !== newCommissionId)]);
    }

    addAuditLog(targetStudentId, 'Commission Created', 'None', initialStatus, `New commission of £${payload.totalCommission} created by ${currentUser.name}.`);
    addNotification('New Commission Created', `Admin created a new commission for ${payload.studentName || (existingStudent ? existingStudent.name : 'Student')} (£${payload.totalCommission}).`, 'info', targetStudentId);
    addToast(`New commission for ${payload.studentName || (existingStudent ? existingStudent.name : 'Student')} (£${payload.totalCommission}) created successfully!`, 'success');
  };

  // 1. Submit Claim (Agent action)
  const submitClaim = (id) => {
    let comm;
    if (id.startsWith('STU-')) {
      comm = commissions.find((c) => c.studentId === id);
    } else {
      comm = commissions.find((c) => c.id === id);
    }
    if (!comm) return;
    const student = students.find((s) => s.id === comm.studentId);
    if (!student) return;

    const studentId = student.id;
    const prevStatus = comm.status;
    const nowIso = new Date().toISOString();

    const updatedComm = {
      ...comm,
      status: 'Under Review',
      claimedAt: nowIso,
      updatedAt: nowIso,
    };

    setCommissions((prev) => prev.map((c) => (c.id === comm.id ? updatedComm : c)));

    // Upsert Claim record
    setClaims((prev) => {
      const existingIdx = prev.findIndex((c) => c.commissionId === comm.id);
      const claimId = `CLM-${comm.id}`;
      if (existingIdx >= 0) {
        return prev.map((c, idx) =>
          idx === existingIdx
            ? {
                ...c,
                status: 'Under Review',
                submittedAt: nowIso,
                notes: `Claim submitted by ${currentUser.name}.`,
              }
            : c
        );
      }
      const newClaim = {
        id: claimId,
        commissionId: comm.id,
        studentId: student.id,
        studentName: student.name,
        university: student.university,
        course: student.course,
        agentId: student.agentId,
        agentName: student.agentName,
        amount: comm.totalCommission,
        submittedAt: nowIso,
        status: 'Under Review',
        notes: `Claim submitted by ${currentUser.name}.`,
      };
      return [newClaim, ...prev];
    });

    addAuditLog(studentId, 'Claim Submitted', prevStatus, 'Under Review', `Commission claim of £${comm.totalCommission}`);
    addNotification('Commission Claim Submitted', `${student.agentName} submitted claim for ${student.name} (£${comm.totalCommission}).`, 'info', studentId);
    addToast(`Commission claim for ${student.name} submitted successfully.`, 'success');
  };

  // 2. Approve Claim (Admin action)
  const approveClaim = (claimId, notes) => {
    let targetClaim = claims.find((c) => c.id === claimId);
    const nowIso = new Date().toISOString();

    if (!targetClaim) {
      // Find matching student by parts or commission
      const matchingComm = commissions.find(
        (c) => claimId.includes(c.studentId) || c.id === claimId
      );
      if (matchingComm) {
        const student = students.find((s) => s.id === matchingComm.studentId);
        if (student) {
          targetClaim = {
            id: claimId,
            commissionId: matchingComm.id,
            studentId: student.id,
            studentName: student.name,
            university: student.university,
            course: student.course,
            agentId: student.agentId,
            agentName: student.agentName,
            amount: matchingComm.totalCommission,
            submittedAt: nowIso,
            status: 'Under Review',
          };
        }
      }
    }

    if (!targetClaim) return;
    const claim = targetClaim;

    const comm = commissions.find((c) => c.studentId === claim.studentId);
    if (!comm) return;

    setClaims((prev) => {
      const exists = prev.some((c) => c.id === claim.id || c.studentId === claim.studentId);
      if (exists) {
        return prev.map((c) => {
          if (c.id === claim.id || c.studentId === claim.studentId) {
            return {
              ...c,
              status: 'Ready for Payment',
              reviewedAt: nowIso,
              reviewedBy: currentUser.name,
              notes: notes || c.notes,
            };
          }
          return c;
        });
      }
      return [
        {
          ...claim,
          status: 'Ready for Payment',
          reviewedAt: nowIso,
          reviewedBy: currentUser.name,
          notes: notes || claim.notes,
        },
        ...prev,
      ];
    });

    setCommissions((prev) =>
      prev.map((c) => (c.studentId === claim.studentId ? { ...c, status: 'Ready for Payment', updatedAt: nowIso } : c))
    );

    addAuditLog(claim.studentId, 'Claim Approved', 'Under Review', 'Ready for Payment', notes || 'Approved by admin');
    addNotification('Claim Approved', `Claim for ${claim.studentName} approved and moved to Ready for Payment.`, 'success', claim.studentId);
    addToast(`Commission for ${claim.studentName} approved and ready for payment.`, 'success');
  };

  // 3. Mark Payment Paid (Admin action)
  const markPaymentPaid = (id, customDate) => {
    let comm;
    if (id.startsWith('STU-')) {
      comm = commissions.find((c) => c.studentId === id);
    } else {
      comm = commissions.find((c) => c.id === id);
    }
    if (!comm) return;
    const student = students.find((s) => s.id === comm.studentId);
    if (!student) return;

    const studentId = student.id;
    const nowIso = new Date().toISOString();
    const paidAtIso = customDate ? new Date(customDate).toISOString() : nowIso;

    // Recalculate financial totals
    const newPaid = comm.totalCommission;
    const newRemaining = 0;

    setCommissions((prev) =>
      prev.map((c) =>
        c.id === comm.id
          ? { ...c, status: 'Paid', paid: newPaid, remaining: newRemaining, paidAt: paidAtIso, updatedAt: nowIso }
          : c
      )
    );

    // Update corresponding claim if exists
    setClaims((prev) =>
      prev.map((cl) =>
        cl.commissionId === comm.id
          ? { ...cl, status: 'Paid', reviewedAt: nowIso, reviewedBy: currentUser.name }
          : cl
      )
    );

    addAuditLog(studentId, 'Payment Disbursed', comm.status, 'Paid', `Payment of £${comm.totalCommission} marked as Paid.`);
    addNotification('Payment Disbursed', `Payment of £${comm.totalCommission} for ${student.name} marked as Paid.`, 'success', studentId);
    addToast(`Payment of £${comm.totalCommission} marked as paid.`, 'success');
  };

  // 4. Adjust Commission (Admin action)
  const adjustCommission = (id, newTotal, reason) => {
    let comm;
    if (id.startsWith('STU-')) {
      comm = commissions.find((c) => c.studentId === id);
    } else {
      comm = commissions.find((c) => c.id === id);
    }
    if (!comm) return;
    const student = students.find((s) => s.id === comm.studentId);
    if (!student) return;

    const studentId = student.id;
    const oldTotal = comm.totalCommission;
    const newRemaining = Math.max(0, newTotal - comm.paid);
    const nowIso = new Date().toISOString();

    setCommissions((prev) =>
      prev.map((c) =>
        c.id === comm.id
          ? {
              ...c,
              totalCommission: newTotal,
              remaining: newRemaining,
              updatedAt: nowIso,
            }
          : c
      )
    );

    addAuditLog(
      studentId,
      'Commission Adjusted',
      `£${oldTotal}`,
      `£${newTotal}`,
      `Reason: ${reason}`
    );
    addNotification('Commission Adjusted', `Commission for ${student.name} adjusted from £${oldTotal} to £${newTotal}.`, 'info', studentId);
    addToast(`Commission amount adjusted from £${oldTotal} to £${newTotal}.`, 'success');
  };

  // 5. Request Clawback (Admin action)
  const requestClawback = (id, amount, reason) => {
    if (currentUser.role !== 'ADMIN') {
      addToast('Unauthorized: Only Admins can initiate clawbacks.', 'error');
      return;
    }

    let comm;
    if (id.startsWith('STU-')) {
      comm = commissions.find((c) => c.studentId === id);
    } else {
      comm = commissions.find((c) => c.id === id);
    }
    if (!comm) return;
    const student = students.find((s) => s.id === comm.studentId);
    if (!student) return;

    const studentId = student.id;
    const nowIso = new Date().toISOString();
    const prevStatus = comm.status;

    setCommissions((prev) =>
      prev.map((c) =>
        c.id === comm.id
          ? {
              ...c,
              status: 'Clawback Requested',
              reason,
              updatedAt: nowIso,
            }
          : c
      )
    );

    // Create Clawback record
    const clawbackRecord = {
      id: `CLW-${Date.now()}`,
      studentId,
      studentName: student.name,
      university: student.university,
      agentId: student.agentId,
      agentName: student.agentName,
      amount,
      reason,
      requestedBy: currentUser.name,
      requestedAt: nowIso,
      status: 'Pending',
      paidBeforeClawback: comm.paid,
    };

    setClawbacks((prev) => [clawbackRecord, ...prev]);
    addAuditLog(studentId, 'Clawback Requested', prevStatus, 'Clawback Requested', `Amount: £${amount}. Reason: ${reason}`);
    addNotification('Clawback Requested', `Clawback request of £${amount} submitted for ${student.name}.`, 'alert', studentId);
    addToast(`Clawback request submitted for £${amount}.`, 'warning');
  };

  // 6. Update Student Status directly (e.g. Withdrawn, Not Eligible)
  const updateStudentStatus = (id, newStatus, reason) => {
    let comm;
    if (id.startsWith('STU-')) {
      comm = commissions.find((c) => c.studentId === id);
    } else {
      comm = commissions.find((c) => c.id === id);
    }
    if (!comm) return;
    const student = students.find((s) => s.id === comm.studentId);
    if (!student) return;

    const studentId = student.id;
    const prevStatus = comm.status;
    const nowIso = new Date().toISOString();

    setCommissions((prev) =>
      prev.map((c) =>
        c.id === comm.id
          ? {
              ...c,
              status: newStatus,
              reason: reason || c.reason,
              updatedAt: nowIso,
            }
          : c
      )
    );

    addAuditLog(studentId, 'Status Changed', prevStatus, newStatus, reason);
    addToast(`Status updated to ${newStatus}.`, 'info');
  };

  // Update Claim Status (Admin dropdown action)
  const updateClaimStatus = (id, newStatus, reason, customDate) => {
    let comm;
    if (id.startsWith('STU-')) {
      comm = commissions.find((c) => c.studentId === id);
    } else if (id.startsWith('COMM-') || id.startsWith('COM-')) {
      comm = commissions.find((c) => c.id === id);
    } else {
      comm = commissions.find((c) => c.id === id || c.studentId === id);
    }
    if (!comm) return;
    const student = students.find((s) => s.id === comm.studentId);
    if (!student) return;
    const studentId = student.id;

    const prevStatus = comm.status;
    if (prevStatus === newStatus) return;

    const nowIso = new Date().toISOString();
    const paidAtIso = customDate ? new Date(customDate).toISOString() : nowIso;

    // Recalculate financial totals
    const newPaid = newStatus === 'Paid' ? comm.totalCommission : 0;
    const newRemaining = newStatus === 'Paid' ? 0 : comm.totalCommission;

    setCommissions((prev) =>
      prev.map((c) =>
        c.id === comm.id
          ? {
              ...c,
              status: newStatus,
              paid: newPaid,
              remaining: newRemaining,
              paidAt: newStatus === 'Paid' ? paidAtIso : undefined,
              claimedAt: newStatus === 'Under Review' ? nowIso : c.claimedAt,
              updatedAt: nowIso,
            }
          : c
      )
    );

    // Update or Upsert or Remove the claim record in claims state
    setClaims((prev) => {
      const claimId = `CLM-${comm.id}`;
      const existingIdx = prev.findIndex((c) => c.commissionId === comm.id);

      if (newStatus === 'Ready to Claim') {
        return prev.filter((c) => c.commissionId !== comm.id);
      }

      const notesText = reason || `Status changed to ${newStatus} by ${currentUser.name}.`;

      if (existingIdx >= 0) {
        return prev.map((c, idx) =>
          idx === existingIdx
            ? {
                ...c,
                status: newStatus,
                reviewedAt: ['Ready for Payment', 'Paid', 'Clawback Requested'].includes(newStatus) ? nowIso : c.reviewedAt,
                reviewedBy: ['Ready for Payment', 'Paid', 'Clawback Requested'].includes(newStatus) ? currentUser.name : c.reviewedBy,
                submittedAt: newStatus === 'Under Review' ? nowIso : c.submittedAt,
                notes: notesText,
              }
            : c
        );
      } else {
        // Insert new claim record
        const newClaim = {
          id: claimId,
          commissionId: comm.id,
          studentId: student.id,
          studentName: student.name,
          university: student.university,
          course: student.course,
          agentId: student.agentId,
          agentName: student.agentName,
          amount: comm.totalCommission,
          submittedAt: nowIso,
          status: newStatus,
          reviewedAt: ['Ready for Payment', 'Paid', 'Clawback Requested'].includes(newStatus) ? nowIso : undefined,
          reviewedBy: ['Ready for Payment', 'Paid', 'Clawback Requested'].includes(newStatus) ? currentUser.name : undefined,
          notes: notesText,
        };
        return [newClaim, ...prev];
      }
    });

    const auditNotes = reason
      ? `Claim status updated to ${newStatus} by ${currentUser.name}. Reason: ${reason}`
      : `Claim status updated to ${newStatus} by ${currentUser.name}.` + (newStatus === 'Paid' && customDate ? ` Paid Date: ${customDate}` : '');

    addAuditLog(
      studentId,
      'Claim Status Updated',
      prevStatus,
      newStatus,
      auditNotes
    );
    addToast(`Claim status updated to ${newStatus}.`, 'success');
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        students,
        commissions,
        claims,
        clawbacks,
        auditLogs,
        notifications,
        agents,
        selectedStudentId,
        setSelectedStudentId,
        activeTab,
        setActiveTab,
        toasts,
        addToast,
        removeToast,
        createCommission,
        submitClaim,
        approveClaim,
        markPaymentPaid,
        adjustCommission,
        requestClawback,
        updateStudentStatus,
        updateClaimStatus,
        markNotificationRead,
        markAllNotificationsRead,
        getStudentWithCommission,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

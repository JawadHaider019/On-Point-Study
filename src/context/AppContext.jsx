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
      return JSON.parse(saved);
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
      // Reset tab if Agent switches away from admin-only tab
      if (target.role === 'AGENT' && ['admin-review', 'clawbacks', 'agents', 'reports'].includes(activeTab)) {
        setActiveTab('dashboard');
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

  // Helper to recalculate overall commission status from instalments
  const calculateOverallStatus = (comm) => {
    if (comm.status === 'Withdrawn') return 'Withdrawn';
    if (comm.status === 'Not Eligible') return 'Not Eligible';
    if (comm.status === 'Clawback Requested') return 'Clawback Requested';

    const insts = comm.instalments;
    if (insts.every((i) => i.status === 'Paid')) return 'Paid';
    if (insts.some((i) => i.status === 'Under Review')) return 'Under Review';
    if (insts.some((i) => i.status === 'Ready for Payment')) return 'Ready for Payment';
    if (insts.some((i) => i.status === 'Ready to Claim')) return 'Ready to Claim';
    return 'In Progress';
  };

  // 0. Create Commission (Admin action)
  const createCommission = (payload) => {
    const existingStudent = payload.studentId
      ? students.find((s) => s.id === payload.studentId)
      : students.find((s) => s.name === payload.studentName);

    const targetStudentId = existingStudent ? existingStudent.id : `STU-${String(students.length + 1).padStart(3, '0')}`;
    const newCommissionId = `COMM-${String(commissions.length + 1).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();

    const firstInstalmentStatus = payload.initialInstalmentStatus || 'Ready to Claim';

    const instalments = [
      {
        id: `INST-${targetStudentId}-1`,
        commissionId: newCommissionId,
        number: 1,
        label: 'Full Commission (100%)',
        amount: payload.totalCommission,
        dueDate: '2026-10-01T00:00:00Z',
        status: firstInstalmentStatus,
      }
    ];

    const overallStatus = firstInstalmentStatus === 'Ready to Claim' ? 'Ready to Claim' : 'In Progress';

    const newCommission = {
      id: newCommissionId,
      studentId: targetStudentId,
      totalCommission: payload.totalCommission,
      paid: 0,
      remaining: payload.totalCommission,
      status: overallStatus,
      agreementType: payload.agreementType,
      instalments,
      updatedAt: nowIso,
    };

    if (existingStudent) {
      setStudents((prev) =>
        prev.map((s) => (s.id === existingStudent.id ? { ...s, commissionId: newCommissionId } : s))
      );
      setCommissions((prev) => [newCommission, ...prev.filter((c) => c.studentId !== existingStudent.id)]);
    } else {
      const newStudent = {
        id: targetStudentId,
        name: payload.studentName,
        university: payload.university,
        course: payload.course,
        intake: payload.intake,
        grossFee: payload.grossFee,
        netFee: payload.grossFee,
        agentId: payload.agentId,
        agentName: payload.agentName,
        commissionId: newCommissionId,
        enrolmentStatus: 'Enrolled',
      };
      setStudents((prev) => [newStudent, ...prev]);
      setCommissions((prev) => [newCommission, ...prev]);
    }

    // Auto-create initial claim record for 1st instalment so it shows up in Claims View immediately
    const initialClaim = {
      id: `CLM-${targetStudentId}-1`,
      instalmentId: instalments[0].id,
      commissionId: newCommissionId,
      studentId: targetStudentId,
      studentName: payload.studentName,
      university: payload.university,
      course: payload.course,
      agentId: payload.agentId,
      agentName: payload.agentName,
      instalmentNumber: 1,
      amount: instalments[0].amount,
      submittedAt: nowIso,
      status: firstInstalmentStatus,
      notes: `Commission created with status ${firstInstalmentStatus}`,
    };
    setClaims((prev) => [initialClaim, ...prev.filter((c) => c.studentId !== targetStudentId)]);

    addAuditLog(targetStudentId, 'Commission Created', 'None', overallStatus, `New commission of £${payload.totalCommission} created by ${currentUser.name}.`);
    addNotification('New Commission Created', `Admin created a new commission for ${payload.studentName} (£${payload.totalCommission}).`, 'info', targetStudentId);
    addToast(`New commission for ${payload.studentName} (£${payload.totalCommission}) created successfully!`, 'success');
  };

  // 1. Submit Claim (Agent action)
  const submitClaim = (studentId, instalmentNumber) => {
    const student = students.find((s) => s.id === studentId);
    const comm = commissions.find((c) => c.studentId === studentId);
    if (!student || !comm) return;

    const inst = comm.instalments.find((i) => i.number === instalmentNumber);
    if (!inst) return;

    const prevStatus = comm.status;
    const nowIso = new Date().toISOString();

    // Update instalment
    const updatedInstalments = comm.instalments.map((i) => {
      if (i.number === instalmentNumber) {
        return { ...i, status: 'Under Review', claimedAt: nowIso };
      }
      return i;
    });

    const updatedComm = {
      ...comm,
      status: 'Under Review',
      instalments: updatedInstalments,
      updatedAt: nowIso,
    };

    setCommissions((prev) => prev.map((c) => (c.studentId === studentId ? updatedComm : c)));

    // Upsert Claim record
    setClaims((prev) => {
      const existingIdx = prev.findIndex(
        (c) => c.studentId === studentId && c.instalmentNumber === instalmentNumber
      );
      if (existingIdx >= 0) {
        return prev.map((c, idx) =>
          idx === existingIdx
            ? {
                ...c,
                status: 'Under Review',
                submittedAt: nowIso,
                notes: `Claim for Instalment ${instalmentNumber} submitted by ${currentUser.name}.`,
              }
            : c
        );
      }
      const newClaim = {
        id: `CLM-${studentId}-${instalmentNumber}`,
        instalmentId: inst.id,
        commissionId: comm.id,
        studentId: student.id,
        studentName: student.name,
        university: student.university,
        course: student.course,
        agentId: student.agentId,
        agentName: student.agentName,
        instalmentNumber,
        amount: inst.amount,
        submittedAt: nowIso,
        status: 'Under Review',
        notes: `Claim for Instalment ${instalmentNumber} submitted by ${currentUser.name}.`,
      };
      return [newClaim, ...prev];
    });

    addAuditLog(studentId, 'Claim Submitted', prevStatus, 'Under Review', `Instalment ${instalmentNumber} claim of £${inst.amount}`);
    addNotification('Commission Claim Submitted', `${student.agentName} submitted claim for ${student.name} (Instalment ${instalmentNumber}).`, 'info', studentId);
    addToast(`Commission claim for ${student.name} (Instalment ${instalmentNumber}) submitted successfully.`, 'success');
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
            instalmentId: matchingComm.instalments[0].id,
            commissionId: matchingComm.id,
            studentId: student.id,
            studentName: student.name,
            university: student.university,
            course: student.course,
            agentId: student.agentId,
            agentName: student.agentName,
            instalmentNumber: 1,
            amount: matchingComm.instalments[0].amount,
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
      const exists = prev.some((c) => c.id === claim.id || (c.studentId === claim.studentId && c.instalmentNumber === claim.instalmentNumber));
      if (exists) {
        return prev.map((c) => {
          if (c.id === claim.id || (c.studentId === claim.studentId && c.instalmentNumber === claim.instalmentNumber)) {
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

    const updatedInstalments = comm.instalments.map((i) => {
      if (i.number === claim.instalmentNumber) {
        return { ...i, status: 'Ready for Payment' };
      }
      return i;
    });

    const newCommStatus = calculateOverallStatus({ ...comm, instalments: updatedInstalments });

    setCommissions((prev) =>
      prev.map((c) => (c.studentId === claim.studentId ? { ...c, status: newCommStatus, instalments: updatedInstalments, updatedAt: nowIso } : c))
    );

    addAuditLog(claim.studentId, 'Claim Approved', 'Under Review', 'Ready for Payment', notes || 'Approved by admin');
    addNotification('Claim Approved', `Claim for ${claim.studentName} approved and moved to Ready for Payment.`, 'success', claim.studentId);
    addToast(`Commission for ${claim.studentName} approved and ready for payment.`, 'success');
  };

  // 3. Mark Payment Paid (Admin action)
  const markPaymentPaid = (studentId, instalmentNumber) => {
    const student = students.find((s) => s.id === studentId);
    const comm = commissions.find((c) => c.studentId === studentId);
    if (!student || !comm) return;

    const inst = comm.instalments.find((i) => i.number === instalmentNumber);
    if (!inst) return;

    const nowIso = new Date().toISOString();

    const updatedInstalments = comm.instalments.map((i) => {
      if (i.number === instalmentNumber) {
        return { ...i, status: 'Paid', paidAt: nowIso };
      }
      return i;
    });

    // Recalculate financial totals
    const newPaid = updatedInstalments.filter((i) => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
    const newRemaining = Math.max(0, comm.totalCommission - newPaid);

    // Calculate new status
    const tempComm = {
      ...comm,
      paid: newPaid,
      remaining: newRemaining,
      instalments: updatedInstalments,
    };
    const newStatus = calculateOverallStatus(tempComm);

    setCommissions((prev) =>
      prev.map((c) =>
        c.studentId === studentId
          ? { ...tempComm, status: newStatus, updatedAt: nowIso }
          : c
      )
    );

    // Update corresponding claim if exists
    setClaims((prev) =>
      prev.map((cl) =>
        cl.studentId === studentId && cl.instalmentNumber === instalmentNumber
          ? { ...cl, status: 'Paid', reviewedAt: nowIso, reviewedBy: currentUser.name }
          : cl
      )
    );

    addAuditLog(studentId, 'Payment Disbursed', comm.status, newStatus, `Payment of £${inst.amount} for Instalment ${instalmentNumber} marked as Paid.`);
    addNotification('Payment Disbursed', `Payment of £${inst.amount} for ${student.name} marked as Paid.`, 'success', studentId);
    addToast(`Payment of £${inst.amount} marked as paid.`, 'success');
  };

  // 4. Adjust Commission (Admin action)
  const adjustCommission = (studentId, newTotal, reason) => {
    const student = students.find((s) => s.id === studentId);
    const comm = commissions.find((c) => c.studentId === studentId);
    if (!student || !comm) return;

    const oldTotal = comm.totalCommission;
    const newRemaining = Math.max(0, newTotal - comm.paid);
    const nowIso = new Date().toISOString();

    // Adjust remaining unpaid instalments proportionally
    const unpaidCount = comm.instalments.filter((i) => i.status !== 'Paid').length;

    let updatedInstalments = comm.instalments;
    if (unpaidCount > 0) {
      const perUnpaidAmount = Math.round(newRemaining / unpaidCount);
      updatedInstalments = comm.instalments.map((i) => {
        if (i.status !== 'Paid') {
          return { ...i, amount: perUnpaidAmount };
        }
        return i;
      });
    }

    setCommissions((prev) =>
      prev.map((c) =>
        c.studentId === studentId
          ? {
              ...c,
              totalCommission: newTotal,
              remaining: newRemaining,
              instalments: updatedInstalments,
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
  const requestClawback = (studentId, amount, reason) => {
    if (currentUser.role !== 'ADMIN') {
      addToast('Unauthorized: Only Admins can initiate clawbacks.', 'error');
      return;
    }

    const student = students.find((s) => s.id === studentId);
    const comm = commissions.find((c) => c.studentId === studentId);
    if (!student || !comm) return;

    const nowIso = new Date().toISOString();
    const prevStatus = comm.status;

    // Update commission & instalments status
    const updatedInstalments = comm.instalments.map((i) => ({
      ...i,
      status: 'Clawback Requested',
    }));

    setCommissions((prev) =>
      prev.map((c) =>
        c.studentId === studentId
          ? {
              ...c,
              status: 'Clawback Requested',
              reason,
              instalments: updatedInstalments,
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
  const updateStudentStatus = (studentId, newStatus, reason) => {
    const student = students.find((s) => s.id === studentId);
    const comm = commissions.find((c) => c.studentId === studentId);
    if (!student || !comm) return;

    const prevStatus = comm.status;
    const nowIso = new Date().toISOString();

    const updatedInstalments = comm.instalments.map((i) => {
      if (i.status !== 'Paid') {
        return { ...i, status: newStatus };
      }
      return i;
    });

    setCommissions((prev) =>
      prev.map((c) =>
        c.studentId === studentId
          ? {
              ...c,
              status: newStatus,
              reason: reason || c.reason,
              instalments: updatedInstalments,
              updatedAt: nowIso,
            }
          : c
      )
    );

    addAuditLog(studentId, 'Status Changed', prevStatus, newStatus, reason);
    addToast(`Status updated to ${newStatus}.`, 'info');
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

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PlusCircle, X, ShieldCheck, ChevronDown, User, Building } from 'lucide-react';

export const CreateCommissionModal = ({ isOpen, onClose }) => {
  const { createCommission, students, currentUser, agents } = useApp();

  const [studentInput, setStudentInput] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [amountValue, setAmountValue] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Reset inputs when modal opens
  useEffect(() => {
    if (isOpen) {
      setStudentInput('');
      setSelectedStudentId('');
      setAmountValue('');
      setSelectedAgentId(agents && agents.length > 0 ? agents[0].id : '');
      setIsDropdownOpen(false);
    }
  }, [isOpen, agents]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen || currentUser.role !== 'ADMIN') return null;

  const selectedStudent =
    students.find((s) => (selectedStudentId && s.id === selectedStudentId) || (studentInput.trim() && s.name.toLowerCase() === studentInput.trim().toLowerCase()));

  const totalCommission = typeof amountValue === 'number' ? amountValue : 0;

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(studentInput.toLowerCase())
  );

  const handleStudentInputChange = (val) => {
    setStudentInput(val);
    setIsDropdownOpen(true);
    const matched = students.find((s) => s.name.toLowerCase() === val.toLowerCase());
    if (matched) {
      setSelectedStudentId(matched.id);
      setSelectedAgentId(matched.agentId);
    }
  };

  const handleSelectStudent = (studentName, studentId) => {
    setStudentInput(studentName);
    setSelectedStudentId(studentId);
    setIsDropdownOpen(false);
    
    const matched = students.find((s) => s.id === studentId);
    if (matched) {
      setSelectedAgentId(matched.agentId);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentInput.trim() || totalCommission <= 0) {
      return;
    }

    const chosenAgent = agents.find((a) => a.id === selectedAgentId) || agents[0] || {
      id: 'agent_001',
      name: 'Global Education Partners',
    };

    const studentToUse = selectedStudent || {
      id: selectedStudentId || `STU-${Date.now()}`,
      name: studentInput.trim(),
      university: 'Partner University',
      course: 'Standard Program',
      intake: 'September 2026',
      grossFee: 15000,
      agentId: chosenAgent.id,
      agentName: chosenAgent.name,
    };

    createCommission({
      studentId: studentToUse.id,
      studentName: studentToUse.name,
      university: studentToUse.university,
      course: studentToUse.course,
      intake: studentToUse.intake,
      grossFee: studentToUse.grossFee,
      agentId: studentToUse.agentId,
      agentName: studentToUse.agentName,
      totalCommission,
      status: 'Ready to Claim',
    });

    onClose();
  };

  return (
    <div
      id="create-commission-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="create-commission-modal-container"
        className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-slate-900 flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 px-6 bg-gradient-to-r from-blue-700 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <PlusCircle className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">Create Commission</h3>
              <p className="text-[11px] text-blue-200">Assign commission to student</p>
            </div>
          </div>
          <button
            id="create-commission-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Custom Interactive Student Combobox Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block font-bold text-slate-700 mb-1.5 text-xs">
              Select or Type Student Name *
            </label>
            <div className="relative">
              <input
                id="create-comm-student-input"
                type="text"
                value={studentInput}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => handleStudentInputChange(e.target.value)}
                placeholder="Type or select student name..."
                className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-semibold text-slate-900 text-xs transition-all"
              />
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dropdown Menu Popup */}
            {isDropdownOpen && filteredStudents.length > 0 && (
              <div
                id="student-dropdown-menu"
                className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-100"
              >
                {filteredStudents.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectStudent(st.name, st.id)}
                    className={`w-full text-left p-2.5 px-3.5 hover:bg-blue-50/80 transition-colors flex items-center justify-between text-xs font-medium ${
                      studentInput.toLowerCase() === st.name.toLowerCase()
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{st.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{st.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Commission Amount Section */}
          <div className="space-y-3">
            <label className="block font-bold text-slate-700 text-xs">
              Enter Commission (£) *
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                £
              </span>
              <input
                id="create-comm-amount-input"
                type="number"
                min="0.01"
                step="any"
                value={amountValue}
                onChange={(e) => setAmountValue(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-extrabold text-sm"
                placeholder="e.g. 1500"
              />
            </div>

            {/* Commission Summary Box */}
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 block">
                  Commission Summary
                </span>
                <span className="text-xs text-blue-600 font-medium">
                  {studentInput ? `Commission for ${studentInput}` : 'Enter student and amount'}
                </span>
              </div>
              <span className="text-base font-black text-blue-900">
                £{totalCommission > 0 ? totalCommission.toLocaleString() : 0}
              </span>
            </div>

            {totalCommission <= 0 && (
              <p className="text-[11px] font-semibold text-rose-600">
                Commission must be greater than £0.
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              id="create-comm-cancel-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="create-comm-submit-btn"
              disabled={!studentInput.trim() || totalCommission <= 0}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Create Commission</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

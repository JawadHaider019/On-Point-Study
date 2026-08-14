import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, ShieldCheck, Check, Save } from 'lucide-react';

export const SettingsView = () => {
  const { currentUser, addToast } = useApp();
  const [defaultAgreement, setDefaultAgreement] = useState('3-Instalment');
  const [defaultCurrency] = useState('GBP (£)');

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Agreement settings saved successfully.', 'success');
  };

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        <ShieldCheck className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs">System configuration is restricted to Finance Administrators.</p>
      </div>
    );
  }

  return (
    <div id="settings-view" className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-700" />
          <span>Commission & Agreement Settings</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure default commission rules, instalment templates, and currency formats.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
            Default Agreement Templates
          </h3>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Default Instalment Structure for New Students
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="template-3-inst-btn"
                onClick={() => setDefaultAgreement('3-Instalment')}
                className={`p-4 rounded-xl border text-left transition-all text-xs ${
                  defaultAgreement === '3-Instalment'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>3-Instalment Model</span>
                  {defaultAgreement === '3-Instalment' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  33.3% at 30 Days • 33.3% at Sem 2 • 33.3% at Completion
                </p>
              </button>

              <button
                type="button"
                id="template-2-inst-btn"
                onClick={() => setDefaultAgreement('2-Instalment')}
                className={`p-4 rounded-xl border text-left transition-all text-xs ${
                  defaultAgreement === '2-Instalment'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>2-Instalment Model</span>
                  {defaultAgreement === '2-Instalment' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  50% at Deposit / Census • 50% at Semester 2 Start
                </p>
              </button>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="block text-xs font-semibold text-slate-700">
              Operating Currency
            </label>
            <input
              type="text"
              disabled
              value={defaultCurrency}
              className="w-full p-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-600 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-500">System is standardized to British Pound Sterling (£) for all UK recruitment.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            id="settings-save-btn"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

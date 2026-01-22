
import React, { useState } from 'react';
import { Scheme } from '../types';

interface Props {
  schemes: Scheme[];
  onVerifyDocs: () => void;
}

export const Dashboard: React.FC<Props> = ({ schemes, onVerifyDocs }) => {
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(schemes[0] || null);

  if (!schemes.length) return <div className="text-center py-20 text-slate-500">No schemes matched. Agent retrying...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
      {/* Sidebar: Eligible Schemes Summary Table */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-900 text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              ✅ Eligible Schemes Summary
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-tighter text-[10px]">Scheme</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-tighter text-[10px]">Eligibility</th>
                  <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-tighter text-[10px]">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schemes.map(s => (
                  <tr 
                    key={s.id} 
                    onClick={() => setSelectedScheme(s)}
                    className={`cursor-pointer transition-colors ${selectedScheme?.id === s.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-4 py-4 font-bold text-slate-800">{s.name}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black ${
                        s.eligibility === 'YES' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {s.eligibility}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-xs">{s.deadline || 'Ongoing'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Risks */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h4 className="font-black text-amber-900 text-sm uppercase mb-3 tracking-widest">⚠️ System-Wide Risks</h4>
          <div className="space-y-3">
             <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">Income verification relies on self-reported data. Hallucination risk in local state policy updates minimized via search grounding.</p>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content: Detailed Action Plan */}
      <div className="lg:col-span-7 space-y-8">
        {selectedScheme && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {selectedScheme.urgency} Urgency
                </span>
                <span className="text-slate-400 text-xs font-mono">ID: {selectedScheme.id}</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2">{selectedScheme.name}</h2>
              <p className="text-slate-500 font-medium mb-4">{selectedScheme.provider} • Benefit: {selectedScheme.benefit}</p>
              
              <div className="flex flex-wrap gap-3">
                 <button 
                  onClick={onVerifyDocs}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2"
                 >
                   Scan & Verify Documents
                 </button>
                 <button className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
                   Full Policy Document
                 </button>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2 italic">
                🛠️ Action Plan (Next 7 Days)
              </h3>
              <div className="grid grid-cols-1 gap-6 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                {selectedScheme.actionPlan.map((step, i) => (
                  <div key={i} className="flex gap-6 relative">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center shrink-0 z-10 text-[10px] font-black">
                      D{step.day}
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-5 w-full border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-1">{step.task}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{step.details}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 italic">📄 Required Documents</h4>
                  <ul className="space-y-3">
                    {selectedScheme.requiredDocuments.map((doc, i) => (
                      <li key={i} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700 font-semibold">{doc.name}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          doc.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-500'
                        }`}>
                          {doc.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 italic">⚠️ Risks & Unknowns</h4>
                  <div className="space-y-3 text-xs">
                    <p className="text-slate-600"><strong>Ambiguity:</strong> {selectedScheme.risks.ambiguity}</p>
                    <p className="text-slate-600"><strong>Document Risk:</strong> {selectedScheme.risks.documentRisk}</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
                  <span className="text-xs font-bold text-blue-800">🔄 Next Autonomous Check</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider">{selectedScheme.nextCheck.trigger}</p>
                  <p className="text-[10px] font-bold text-blue-700/60">{selectedScheme.nextCheck.date}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

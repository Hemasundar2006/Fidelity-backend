import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, AlertTriangle, ShieldCheck, X, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PregnancyTracker = () => {
  const { id } = useParams();
  const { authHeader } = useAuth();
  
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatientData = async () => {
    try {
      const patientRes = await fetch(`http://localhost:5000/api/v1/patients/${id}`, { headers: authHeader() });
      const patientData = await patientRes.json();
      if (patientData.success) {
        setPatientData(patientData.data);
      }

      const visitsRes = await fetch(`http://localhost:5000/api/v1/patients/${id}/visits`, { headers: authHeader() });
      const visitsData = await visitsRes.json();
      if (visitsData.success) {
        setVisits(visitsData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPatientData();
  }, [id, authHeader]);

  const currentWeek = patientData?.lmp ? Math.floor((new Date() - new Date(patientData.lmp)) / (1000 * 60 * 60 * 24 * 7)) : 12;
  const edd = patientData?.edd ? new Date(patientData.edd).toLocaleDateString('en-GB') : '2027-04-07';

  // Render the progress bar
  const renderProgressBar = () => {
    const totalWeeks = 40;
    const progressPercent = Math.min((currentWeek / totalWeeks) * 100, 100);
    
    return (
      <div className="card mb-8 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-blue-800 m-0">Gestation Progress</h3>
          <span className="font-semibold text-sm text-blue-600 font-mono">EDD: {edd}</span>
        </div>
        
        <div className="h-3 w-full bg-ink-200 rounded-full overflow-hidden relative mb-2">
          <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
        </div>
        
        <div className="flex justify-between mt-2 text-xs font-semibold text-ink-600">
          <span>Week 1</span>
          <span className="text-blue-600 font-bold">Week {currentWeek} (Current)</span>
          <span>Week 40</span>
        </div>
      </div>
    );
  };

  if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <div className="pb-8 max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-[28px] max-sm:text-[22px] leading-[36px] max-sm:leading-[30px] font-heading font-semibold text-blue-800 m-0">Pregnancy Tracker</h1>
          <p className="text-[18px] max-sm:text-[16px] leading-[26px] text-ink-600 m-0">Clinical record for {patientData?.name || id}</p>
        </div>
        <div className="chip chip-amber py-1.5 px-3 text-sm">
          <AlertTriangle size={18} /> Mid Risk Pregnancy
        </div>
      </div>

      {renderProgressBar()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Vitals Summary */}
          <div className="card">
            <h3 className="text-base font-semibold text-blue-800 mb-4">Clinical Trends</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-ink-50 rounded-card border border-amber-300">
                <span className="text-xs uppercase text-ink-600 font-semibold block mb-1">Blood Pressure</span>
                <span className="text-xl font-bold font-heading text-danger block">150/98 <small className="text-xs font-normal text-ink-600">mmHg</small></span>
                <span className="text-xs text-warning-dark font-medium mt-1 block">Elevated (Stage 1)</span>
              </div>
              <div className="p-4 bg-ink-50 rounded-card border border-ink-200">
                <span className="text-xs uppercase text-ink-600 font-semibold block mb-1">Weight</span>
                <span className="text-xl font-bold font-heading text-ink-900 block">62 <small className="text-xs font-normal text-ink-600">kg</small></span>
                <span className="text-xs text-success font-medium mt-1 block">+2kg since booking</span>
              </div>
              <div className="p-4 bg-ink-50 rounded-card border border-amber-300">
                <span className="text-xs uppercase text-ink-600 font-semibold block mb-1">Hemoglobin</span>
                <span className="text-xl font-bold font-heading text-danger block">9.8 <small className="text-xs font-normal text-ink-600">g/dL</small></span>
                <span className="text-xs text-warning-dark font-medium mt-1 block">Below 11 g/dL</span>
              </div>
            </div>
          </div>

          {/* Antenatal Visits Table */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="m-0 text-base font-semibold text-blue-800">Antenatal Visits</h3>
              <button className="btn btn-primary text-sm py-1.5 px-3" onClick={() => setShowAddVisit(true)}>
                <Plus size={16} /> Record Visit
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50/50">
                    <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ width: '16%', minWidth: '110px' }}>Date</th>
                    <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ width: '14%', minWidth: '100px' }}>Gestation</th>
                    <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ width: '16%', minWidth: '120px' }}>BP (mmHg)</th>
                    <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ width: '14%', minWidth: '100px' }}>Weight (kg)</th>
                    <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ width: '14%', minWidth: '100px' }}>FHR (bpm)</th>
                    <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ width: '26%', minWidth: '160px' }}>Clinical Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.length > 0 ? visits.map(v => (
                    <tr key={v._id} className="border-b border-ink-50 hover:bg-blue-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-ink-900 text-[13px]">{new Date(v.visitDate).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-3 text-ink-700 text-[13px]">{v.vitals?.weeks || Math.floor((new Date(v.visitDate) - new Date(patientData?.lmp || new Date())) / (1000 * 60 * 60 * 24 * 7)) || '-'} wks</td>
                      <td className={`px-4 py-3 text-[13px] ${v.vitals?.bpSys >= 140 ? 'text-red-600 font-semibold' : 'text-ink-700'}`}>{v.vitals?.bpSys ? `${v.vitals.bpSys}/${v.vitals.bpDia}` : '-'}</td>
                      <td className="px-4 py-3 text-ink-700 text-[13px]">{v.vitals?.weightKg || '-'}</td>
                      <td className="px-4 py-3 text-ink-700 text-[13px]">{v.vitals?.fhr || '-'}</td>
                      <td className="px-4 py-3 text-[12px] text-ink-600">{v.notes || '-'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="text-center p-6 text-ink-600">No clinical visits recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Rail: Risk Assessment */}
        <div className="flex flex-col gap-6">
          <div className="card border-t-4 border-t-warning">
            <h3 className="text-base font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-warning" /> ML Risk Assessment
            </h3>
            
            <div className="mb-6 bg-ink-50 p-4 rounded-card border border-ink-200 text-center">
              <p className="text-xs text-ink-600 mb-1">Current Classifier Result</p>
              <h2 className="text-warning font-bold text-xl m-0">Mid Risk</h2>
              <p className="text-xs text-ink-400 mt-1">Confidence: 82%</p>
            </div>

            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-600 mb-3">Top Contributing Factors</h4>
            
            <div className="mb-3.5">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-ink-600">Systolic BP (150)</span>
                <span className="font-semibold text-warning">High Impact</span>
              </div>
              <div className="h-2 w-full bg-ink-200 rounded-full overflow-hidden">
                <div className="h-full bg-warning rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="mb-3.5">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-ink-600">Hemoglobin (9.8)</span>
                <span className="font-semibold text-warning">High Impact</span>
              </div>
              <div className="h-2 w-full bg-ink-200 rounded-full overflow-hidden">
                <div className="h-full bg-warning rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-ink-600">Age (30)</span>
                <span className="font-semibold text-ink-600">Low Impact</span>
              </div>
              <div className="h-2 w-full bg-ink-200 rounded-full overflow-hidden">
                <div className="h-full bg-ink-200 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-ink-200 text-[11px] text-ink-400 space-y-0.5">
              <p className="m-0">Model: pregnancy_risk_v1</p>
              <p className="m-0">Last evaluated: 2026-09-28 10:30 UTC</p>
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel for Adding Visit */}
      {showAddVisit && (
        <div className="fixed inset-0 bg-blue-800/40 backdrop-blur-[2px] z-50 flex justify-end" onClick={() => setShowAddVisit(false)}>
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-ink-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-blue-800 m-0">Record Antenatal Visit</h2>
              <button 
                type="button" 
                className="p-1 text-ink-400 hover:text-ink-900 rounded hover:bg-ink-100 transition-colors border-0 bg-transparent cursor-pointer"
                onClick={() => setShowAddVisit(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={(e) => { e.preventDefault(); setShowAddVisit(false); }}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Visit Date</label>
                    <input type="date" className="input max-sm:h-[48px] max-sm:text-[16px]" defaultValue="2026-10-01" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Gestation (Weeks)</label>
                    <input type="number" className="input max-sm:h-[48px] max-sm:text-[16px]" defaultValue="13" />
                  </div>
                </div>

                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-600 mb-3 mt-6 border-b pb-2 border-ink-200">Clinical Vitals</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">BP Systolic</label>
                    <input type="number" className="input max-sm:h-[48px] max-sm:text-[16px]" placeholder="mmHg" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">BP Diastolic</label>
                    <input type="number" className="input max-sm:h-[48px] max-sm:text-[16px]" placeholder="mmHg" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Weight (kg)</label>
                    <input type="number" className="input max-sm:h-[48px] max-sm:text-[16px]" step="0.1" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Fetal Heart Rate (bpm)</label>
                    <input type="number" className="input max-sm:h-[48px] max-sm:text-[16px]" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Clinical Notes / Scan Findings</label>
                  <textarea className="input max-sm:h-[48px] max-sm:text-[16px]" rows="4" style={{ resize: 'vertical' }}></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-ink-200">
                  <button type="button" className="btn btn-outline" onClick={() => setShowAddVisit(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Visit & Run Risk ML</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PregnancyTracker;

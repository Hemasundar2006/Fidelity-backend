import React, { useState } from 'react';
import { Activity, AlertTriangle, ShieldCheck, HeartPulse, Stethoscope, Droplets, ArrowRight, Baby } from 'lucide-react';

const MaternalHealthPredictor = () => {
  const [formData, setFormData] = useState({
    age: '',
    gravida: '',
    tt_dose: '',
    gestational_age: '',
    weight: '',
    height: '',
    systolic_bp: '',
    diastolic_bp: '',
    anemia: 'no',
    jaundice: 'no',
    fetal_position: 'cephalic',
    fetal_movement: 'normal',
    fetal_heart_rate: '',
    urine_albumin: 'negative',
    urine_sugar: 'negative',
    vdrl: 'non-reactive',
    hrsag: 'negative'
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        ...formData,
        age: Number(formData.age) || 0,
        gestational_age: Number(formData.gestational_age) || 0,
        weight: Number(formData.weight) || 0,
        height: Number(formData.height) || 0,
        systolic_bp: Number(formData.systolic_bp) || 0,
        diastolic_bp: Number(formData.diastolic_bp) || 0,
        fetal_heart_rate: Number(formData.fetal_heart_rate) || 0,
      };

      const res = await fetch('https://maternal-health-prediction-1.onrender.com/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Prediction API failed. Please check your inputs.');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch prediction.');
    } finally {
      setLoading(false);
    }
  };

  const isHighRisk = result && typeof result === 'string' && result.toLowerCase().includes('high');
  const resultText = typeof result === 'string' ? result : JSON.stringify(result);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#76C0EC]/10 to-transparent rounded-full -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#76C0EC] to-[#4A90E2] shadow-lg flex items-center justify-center shrink-0">
            <Activity size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">AI Risk Predictor</h1>
            <p className="text-slate-500 mt-1 font-medium">Advanced maternal health risk assessment using clinical ML models.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Form Area */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-10">
              
              {/* Section 1: Vitals */}
              <section>
                <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-100">
                  <Stethoscope size={18} className="text-[#76C0EC]" />
                  <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-widest">Patient Vitals & Demographics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age (Years)</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} required className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#76C0EC] focus:ring-4 focus:ring-[#76C0EC]/10 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gravida (G)</label>
                    <input type="text" name="gravida" value={formData.gravida} onChange={handleChange} required placeholder="e.g. G1P0" className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#76C0EC] focus:ring-4 focus:ring-[#76C0EC]/10 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weight (kg)</label>
                    <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} required className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#76C0EC] focus:ring-4 focus:ring-[#76C0EC]/10 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Height (cm)</label>
                    <input type="number" step="1" name="height" value={formData.height} onChange={handleChange} required className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#76C0EC] focus:ring-4 focus:ring-[#76C0EC]/10 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Systolic BP</label>
                    <input type="number" name="systolic_bp" value={formData.systolic_bp} onChange={handleChange} required placeholder="mmHg" className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#76C0EC] focus:ring-4 focus:ring-[#76C0EC]/10 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Diastolic BP</label>
                    <input type="number" name="diastolic_bp" value={formData.diastolic_bp} onChange={handleChange} required placeholder="mmHg" className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#76C0EC] focus:ring-4 focus:ring-[#76C0EC]/10 transition-all" />
                  </div>
                </div>
              </section>

              {/* Section 2: Obstetrics */}
              <section>
                <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-100">
                  <Baby size={18} className="text-[#FF95A5]" />
                  <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-widest">Obstetrics & Fetal Parameters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gestational Age (Wks)</label>
                    <input type="number" name="gestational_age" value={formData.gestational_age} onChange={handleChange} required className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#FF95A5] focus:ring-4 focus:ring-[#FF95A5]/10 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">TT Dose</label>
                    <input type="text" name="tt_dose" value={formData.tt_dose} onChange={handleChange} required placeholder="e.g. 2" className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#FF95A5] focus:ring-4 focus:ring-[#FF95A5]/10 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fetal Position</label>
                    <select name="fetal_position" value={formData.fetal_position} onChange={handleChange} className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#FF95A5] transition-all">
                      <option value="cephalic">Cephalic</option>
                      <option value="breech">Breech</option>
                      <option value="transverse">Transverse</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fetal Movement</label>
                    <select name="fetal_movement" value={formData.fetal_movement} onChange={handleChange} className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#FF95A5] transition-all">
                      <option value="normal">Normal</option>
                      <option value="decreased">Decreased</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fetal Heart Rate (bpm)</label>
                    <input type="number" name="fetal_heart_rate" value={formData.fetal_heart_rate} onChange={handleChange} required className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#FF95A5] focus:ring-4 focus:ring-[#FF95A5]/10 transition-all" />
                  </div>
                </div>
              </section>

              {/* Section 3: Labs */}
              <section>
                <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-100">
                  <Droplets size={18} className="text-purple-500" />
                  <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-widest">Lab Diagnostics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[
                    { id: 'anemia', label: 'Anemia' },
                    { id: 'jaundice', label: 'Jaundice' },
                    { id: 'urine_albumin', label: 'Urine Albumin' },
                    { id: 'urine_sugar', label: 'Urine Sugar' },
                    { id: 'vdrl', label: 'VDRL (Syphilis)' },
                    { id: 'hrsag', label: 'HBsAg (Hepatitis B)' }
                  ].map(field => (
                    <div key={field.id} className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{field.label}</label>
                      <input type="text" name={field.id} value={formData[field.id]} onChange={handleChange} className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 transition-all" />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="h-12 px-8 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                style={{ backgroundColor: '#76C0EC' }}
              >
                {loading ? (
                  <>Running AI Model...</>
                ) : (
                  <>Compute Health Risk <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Panel */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 text-center">
              <h2 className="font-heading font-extrabold text-slate-800 text-lg uppercase tracking-wider">Analysis Result</h2>
            </div>
            
            <div className="p-8 min-h-[350px] flex flex-col justify-center">
              {error && (
                <div className="p-5 bg-red-50 border border-red-200 rounded-xl flex flex-col items-center text-center">
                  <AlertTriangle size={32} className="text-red-500 mb-3" />
                  <p className="text-red-700 font-bold mb-1">API Error</p>
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              {!result && !error && !loading && (
                <div className="flex flex-col items-center text-center text-slate-400 py-10">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100">
                    <Activity size={32} className="text-slate-300" />
                  </div>
                  <h4 className="text-slate-600 font-bold mb-2">Awaiting Parameters</h4>
                  <p className="text-sm">Complete the clinical form on the left and compute the risk score.</p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center text-center py-10">
                  <div className="w-16 h-16 rounded-full border-[3px] border-[#76C0EC]/20 border-t-[#76C0EC] animate-spin mb-6 shadow-sm" />
                  <h4 className="text-[#76C0EC] font-bold">Processing...</h4>
                  <p className="text-sm text-slate-500 mt-2">Running parameters through predictive model.</p>
                </div>
              )}

              {result && !loading && (
                <div className="flex flex-col items-center text-center animate-fade-in">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg border-4 ${isHighRisk ? 'bg-red-50 border-red-100 text-red-500 shadow-red-500/20' : 'bg-emerald-50 border-emerald-100 text-emerald-500 shadow-emerald-500/20'}`}>
                    {isHighRisk ? <AlertTriangle size={40} /> : <ShieldCheck size={40} />}
                  </div>
                  
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Model Classification</h3>
                  
                  <div className={`text-3xl font-black font-heading capitalize mb-6 ${isHighRisk ? 'text-red-600' : 'text-emerald-600'}`}>
                    {resultText}
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 w-full">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      This AI prediction is an adjunctive tool. Always rely on clinical judgement and established medical protocols for final diagnosis.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default MaternalHealthPredictor;

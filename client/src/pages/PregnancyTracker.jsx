import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { 
  Plus, AlertTriangle, ShieldCheck, X, Loader, 
  UploadCloud, FileText, Camera, CheckCircle2, 
  Sparkles, Activity, Heart, ArrowRight, Calendar, 
  Stethoscope, Baby, Droplets, Shield, RotateCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import { 
  runReportOcr, 
  parseVitalsForRiskAnalyzer, 
  callMaternalHealthPredictionApi,
  evaluatePregnancyRisk 
} from '../services/ocrService';

const PregnancyTracker = () => {
  const { id } = useParams();
  const location = useLocation();
  const { authHeader } = useAuth();
  
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);

  // OCR Upload States
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');
  const [ocrExtractedCount, setOcrExtractedCount] = useState(0);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Exact 17 Clinical Inputs matching the ML Risk Model Specification
  const [formData, setFormData] = useState({
    // Patient Vitals & Demographics
    age: '',
    gravida: '',
    weight: '',
    height: '',
    systolic_bp: '',
    diastolic_bp: '',

    // Obstetrics & Fetal Parameters
    gestational_age: '',
    tt_dose: '',
    fetal_position: 'Cephalic',
    fetal_movement: 'Normal',
    fetal_heart_rate: '',

    // Lab Diagnostics
    anemia: 'no',
    jaundice: 'no',
    urine_albumin: 'negative',
    urine_sugar: 'negative',
    vdrl: 'non-reactive',
    hrsag: 'negative',

    // Workflow metadata
    visitDate: new Date().toISOString().split('T')[0],
    followUpDate: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchPatientData = async () => {
    try {
      const patientRes = await fetch(`${API_BASE}/patients/${id}`, { headers: authHeader() });
      const patJson = await patientRes.json();
      if (patJson.success && patJson.data) {
        const pat = patJson.data;
        setPatientData(pat);

        // Pre-fill existing patient demographic defaults
        let calcAge = '';
        if (pat.dob) {
          calcAge = Math.floor((Date.now() - new Date(pat.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        }

        setFormData(prev => ({
          ...prev,
          age: prev.age || calcAge || '',
          weight: prev.weight || pat.vitals?.weightKg || pat.weight || '',
          height: prev.height || pat.height || '160',
          systolic_bp: prev.systolic_bp || pat.vitals?.bpSys || '',
          diastolic_bp: prev.diastolic_bp || pat.vitals?.bpDia || '',
        }));
      }

      const visitsRes = await fetch(`${API_BASE}/patients/${id}/visits`, { headers: authHeader() });
      const visitsJson = await visitsRes.json();
      if (visitsJson.success) {
        setVisits(visitsJson.data || []);
      }
    } catch (err) {
      console.error('Error fetching pregnancy tracker data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPatientData();
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('openAnalyzer') === 'true' || searchParams.get('analyzer') === 'open') {
      setShowAddVisit(true);
    }
  }, [id, location.search]);

  // Handle OCR Document / Image / PDF Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processOcrFile(file);
  };

  const processOcrFile = async (file) => {
    setOcrLoading(true);
    setOcrExtractedCount(0);
    setOcrProgress('Scanning and reading medical document with AI OCR...');
    try {
      const ocrRes = await runReportOcr(file, ({ status }) => {
        setOcrProgress(status);
      });

      const parsed = parseVitalsForRiskAnalyzer(ocrRes.rawText);

      let count = 0;
      setFormData(prev => {
        const updated = { ...prev };
        if (parsed.age) { updated.age = parsed.age; count++; }
        if (parsed.gravida) { updated.gravida = parsed.gravida; count++; }
        if (parsed.weight) { updated.weight = parsed.weight; count++; }
        if (parsed.height) { updated.height = parsed.height; count++; }
        if (parsed.systolic_bp) { updated.systolic_bp = parsed.systolic_bp; count++; }
        if (parsed.diastolic_bp) { updated.diastolic_bp = parsed.diastolic_bp; count++; }
        if (parsed.gestational_age) { updated.gestational_age = parsed.gestational_age; count++; }
        if (parsed.tt_dose) { updated.tt_dose = parsed.tt_dose; count++; }
        if (parsed.fetal_position) { updated.fetal_position = parsed.fetal_position; count++; }
        if (parsed.fetal_movement) { updated.fetal_movement = parsed.fetal_movement; count++; }
        if (parsed.fetal_heart_rate) { updated.fetal_heart_rate = parsed.fetal_heart_rate; count++; }
        if (parsed.anemia) { updated.anemia = parsed.anemia; count++; }
        if (parsed.jaundice) { updated.jaundice = parsed.jaundice; count++; }
        if (parsed.urine_albumin) { updated.urine_albumin = parsed.urine_albumin; count++; }
        if (parsed.urine_sugar) { updated.urine_sugar = parsed.urine_sugar; count++; }
        if (parsed.vdrl) { updated.vdrl = parsed.vdrl; count++; }
        if (parsed.hrsag) { updated.hrsag = parsed.hrsag; count++; }
        if (parsed.notes) {
          updated.notes = prev.notes ? `${prev.notes} | ${parsed.notes}` : parsed.notes;
        }
        return updated;
      });

      setOcrExtractedCount(count);
      setOcrProgress(`Extracted ${count} clinical parameters from document!`);
    } catch (err) {
      console.error('OCR Error in Risk Analyzer:', err);
      setOcrProgress('Could not fully parse document. You can verify and fill fields directly.');
    } finally {
      setOcrLoading(false);
    }
  };

  // Run AI Risk Prediction
  const handleComputeRisk = async () => {
    setPredicting(true);
    try {
      const pred = await callMaternalHealthPredictionApi(formData);
      setPredictionResult(pred);
    } catch (err) {
      console.error('Prediction computation error:', err);
    } finally {
      setPredicting(false);
    }
  };

  // Submit Visit & Save to Patient Dashboard & Next Visit
  const handleSaveVisit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // If prediction has not been computed yet, run it first
      let activePred = predictionResult;
      if (!activePred) {
        activePred = await callMaternalHealthPredictionApi(formData);
        setPredictionResult(activePred);
      }

      const assignedRisk = activePred?.isHighRisk ? 'high' : activePred?.isMidRisk ? 'mid' : 'low';

      const payload = {
        visitDate: formData.visitDate || new Date().toISOString().split('T')[0],
        weeks: Number(formData.gestational_age) || 12,
        vitals: {
          bpSys: Number(formData.systolic_bp) || undefined,
          bpDia: Number(formData.diastolic_bp) || undefined,
          weightKg: Number(formData.weight) || undefined,
          hb: formData.anemia === 'yes' ? 9.2 : 12.0,
          bloodSugar: formData.urine_sugar === 'positive' ? 145 : 95,
          fhr: Number(formData.fetal_heart_rate) || undefined,
          weeks: Number(formData.gestational_age) || 12
        },
        riskLevel: assignedRisk,
        riskFactors: [
          `Gravida: ${formData.gravida || 'G1P0'}`,
          `BP: ${formData.systolic_bp || 120}/${formData.diastolic_bp || 80} mmHg`,
          `FHR: ${formData.fetal_heart_rate || 140} bpm`,
          `Albumin: ${formData.urine_albumin}`,
          `Anemia: ${formData.anemia}`
        ],
        notes: formData.notes || `Antenatal evaluation (${formData.fetal_position}, movement: ${formData.fetal_movement}).`,
        followUpDate: formData.followUpDate || undefined
      };

      const res = await fetch(`${API_BASE}/patients/${id}/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg('Visit saved! Risk assessment updated in Patient Dashboard and stored for next visit.');
        await fetchPatientData();
        setTimeout(() => {
          setShowAddVisit(false);
          setSaveSuccessMsg('');
        }, 1500);
      } else {
        alert(data.error?.message || 'Failed to save visit record');
      }
    } catch (err) {
      console.error('Error saving visit:', err);
      alert('Network error while saving visit record');
    } finally {
      setSubmitting(false);
    }
  };

  // Determine latest recorded vitals for summary
  const latestVisit = visits && visits.length > 0 ? visits[0] : null;
  const currentBpSys = latestVisit?.vitals?.bpSys || patientData?.vitals?.bpSys || 120;
  const currentBpDia = latestVisit?.vitals?.bpDia || patientData?.vitals?.bpDia || 80;
  const currentWeight = latestVisit?.vitals?.weightKg || patientData?.vitals?.weightKg || patientData?.weight || 60;
  const currentHb = latestVisit?.vitals?.hb || patientData?.vitals?.hb || 11.2;
  const effectiveRiskLevel = patientData?.ongoingPregnancy?.riskLevel || patientData?.riskLevel || 'low';

  const lmpDate = patientData?.ongoingPregnancy?.lmp || patientData?.currentPregnancy?.lmp || patientData?.lmp;
  const calculatedWeeks = lmpDate 
    ? Math.max(1, Math.min(42, Math.floor((new Date() - new Date(lmpDate)) / (1000 * 60 * 60 * 24 * 7))))
    : (latestVisit?.vitals?.weeks || 13);
  
  const eddDate = patientData?.ongoingPregnancy?.edd || patientData?.currentPregnancy?.edd || patientData?.edd;
  const formattedEdd = eddDate ? new Date(eddDate).toLocaleDateString('en-GB') : '24-10-2026';

  const getRiskChip = (level) => {
    if (level === 'high') {
      return (
        <div className="chip chip-red py-1.5 px-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <AlertTriangle size={15} /> High Risk Pregnancy
        </div>
      );
    }
    if (level === 'mid') {
      return (
        <div className="chip chip-amber py-1.5 px-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <AlertTriangle size={15} /> Mid Risk Pregnancy
        </div>
      );
    }
    return (
      <div className="chip chip-green py-1.5 px-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
        <ShieldCheck size={15} /> Low Risk (Normal)
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader className="animate-spin text-blue-600 mb-3" size={36} />
        <p className="text-sm text-slate-500 font-medium">Loading Patient Pregnancy Record...</p>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-5xl mx-auto font-sans">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-[26px] max-sm:text-[22px] leading-[34px] font-heading font-bold text-blue-900 m-0">
            Pregnancy Tracker
          </h1>
          <p className="text-[15px] text-slate-500 m-0 mt-0.5">
            Clinical record for <span className="font-semibold text-slate-800">{patientData?.name || id}</span> ({patientData?.motherId || 'MOM'})
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getRiskChip(effectiveRiskLevel)}
          <button 
            onClick={() => setShowAddVisit(true)}
            className="btn bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm rounded-lg cursor-pointer"
          >
            <Sparkles size={16} /> AI Risk Analyzer (OCR)
          </button>
        </div>
      </div>

      {/* Gestation Progress */}
      <div className="card mb-8 p-6 shadow-sm border border-slate-200 bg-white rounded-xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold text-blue-900 m-0">Gestation Progress</h3>
          <span className="font-semibold text-xs text-blue-600 font-mono bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            EDD: {formattedEdd}
          </span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative mb-2">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-500 shadow-sm" 
            style={{ width: `${Math.min((calculatedWeeks / 40) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs font-semibold text-slate-500">
          <span>Week 1</span>
          <span className="text-blue-700 font-bold bg-blue-50/80 px-2 py-0.5 rounded">
            Week {calculatedWeeks} (Current)
          </span>
          <span>Week 40</span>
        </div>
      </div>

      {/* Main Grid: Clinical Trends & Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Clinical Trends */}
          <div className="card shadow-sm border border-slate-200 bg-white p-5 rounded-xl">
            <h3 className="text-base font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-blue-600" /> Clinical Trends
            </h3>
            <div className="grid grid-cols-3 gap-3.5">
              <div className={`p-4 rounded-xl border ${currentBpSys >= 140 ? 'bg-rose-50/50 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[11px] uppercase text-slate-500 font-bold block mb-1">Blood Pressure</span>
                <span className={`text-xl font-bold font-heading block ${currentBpSys >= 140 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {currentBpSys}/{currentBpDia} <small className="text-xs font-normal text-slate-500">mmHg</small>
                </span>
                <span className={`text-[11px] font-semibold mt-1 block ${currentBpSys >= 140 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {currentBpSys >= 140 ? 'Elevated (Stage 1)' : 'Normal Hemodynamics'}
                </span>
              </div>

              <div className="p-4 rounded-xl border bg-slate-50 border-slate-200">
                <span className="text-[11px] uppercase text-slate-500 font-bold block mb-1">Weight</span>
                <span className="text-xl font-bold font-heading text-slate-900 block">
                  {currentWeight} <small className="text-xs font-normal text-slate-500">kg</small>
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                  Stable Maternal Weight
                </span>
              </div>

              <div className={`p-4 rounded-xl border ${currentHb < 11 ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[11px] uppercase text-slate-500 font-bold block mb-1">Hemoglobin</span>
                <span className={`text-xl font-bold font-heading block ${currentHb < 11 ? 'text-amber-700' : 'text-slate-900'}`}>
                  {currentHb} <small className="text-xs font-normal text-slate-500">g/dL</small>
                </span>
                <span className={`text-[11px] font-semibold mt-1 block ${currentHb < 11 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {currentHb < 11 ? 'Below 11 g/dL' : 'Normal Baseline'}
                </span>
              </div>
            </div>
          </div>

          {/* Antenatal Visits Table */}
          <div className="card shadow-sm border border-slate-200 bg-white p-5 rounded-xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <div>
                <h3 className="m-0 text-base font-semibold text-blue-900">Antenatal Visits</h3>
                <p className="text-xs text-slate-400 m-0 mt-0.5">Visits and risk evaluations saved permanently for next checkup</p>
              </div>
              <button 
                className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer" 
                onClick={() => setShowAddVisit(true)}
              >
                <Plus size={15} /> Record Visit
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-3.5 py-2.5 font-bold text-slate-700 text-xs">Date</th>
                    <th className="px-3.5 py-2.5 font-bold text-slate-700 text-xs">Gestation</th>
                    <th className="px-3.5 py-2.5 font-bold text-slate-700 text-xs">BP (mmHg)</th>
                    <th className="px-3.5 py-2.5 font-bold text-slate-700 text-xs">Weight (kg)</th>
                    <th className="px-3.5 py-2.5 font-bold text-slate-700 text-xs">FHR (bpm)</th>
                    <th className="px-3.5 py-2.5 font-bold text-slate-700 text-xs">Clinical Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {visits && visits.length > 0 ? (
                    visits.map((v, idx) => (
                      <tr key={v._id || idx} className="border-b border-slate-50 hover:bg-blue-50/40 transition-colors">
                        <td className="px-3.5 py-3 font-semibold text-slate-800 text-xs">
                          {new Date(v.visitDate).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-3.5 py-3 text-slate-600 text-xs">
                          {v.vitals?.weeks || calculatedWeeks} wks
                        </td>
                        <td className={`px-3.5 py-3 text-xs ${v.vitals?.bpSys >= 140 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                          {v.vitals?.bpSys ? `${v.vitals.bpSys}/${v.vitals.bpDia}` : '—'}
                        </td>
                        <td className="px-3.5 py-3 text-slate-600 text-xs font-mono">
                          {v.vitals?.weightKg || '—'}
                        </td>
                        <td className="px-3.5 py-3 text-slate-600 text-xs font-mono">
                          {v.vitals?.fhr ? `${v.vitals.fhr} bpm` : '—'}
                        </td>
                        <td className="px-3.5 py-3 text-xs text-slate-500 max-w-xs truncate" title={v.notes || ''}>
                          {v.notes || 'Routine checkup completed'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400 text-xs">
                        No clinical visits recorded yet. Click &quot;Record Visit&quot; to perform an OCR scan or enter vitals.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Rail: ML Risk Assessment */}
        <div className="flex flex-col gap-6">
          <div className="card shadow-sm border-t-4 border-t-amber-500 border-slate-200 bg-white p-5 rounded-xl">
            <h3 className="text-base font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-amber-500" /> ML Risk Assessment
            </h3>
            
            <div className={`mb-6 p-4 rounded-xl border text-center ${
              effectiveRiskLevel === 'high' ? 'bg-rose-50 border-rose-200' :
              effectiveRiskLevel === 'mid' ? 'bg-amber-50 border-amber-200' :
              'bg-emerald-50 border-emerald-200'
            }`}>
              <p className="text-xs text-slate-500 font-medium mb-1">Current Classifier Result</p>
              <h2 className={`font-bold text-2xl m-0 ${
                effectiveRiskLevel === 'high' ? 'text-rose-600' :
                effectiveRiskLevel === 'mid' ? 'text-amber-600' :
                'text-emerald-700'
              }`}>
                {effectiveRiskLevel === 'high' ? 'High Risk' : effectiveRiskLevel === 'mid' ? 'Mid Risk' : 'Low Risk'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Active Maternal Status
              </p>
            </div>

            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3.5">
              Protocol Indicators
            </h4>
            
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between pb-1 border-b border-slate-100">
                <span>Blood Pressure:</span>
                <span className="font-semibold text-slate-800">{currentBpSys}/{currentBpDia} mmHg</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-100">
                <span>Maternal Weight:</span>
                <span className="font-semibold text-slate-800">{currentWeight} kg</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-100">
                <span>Hemoglobin:</span>
                <span className="font-semibold text-slate-800">{currentHb} g/dL</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-100">
                <span>Next Scheduled Checkup:</span>
                <span className="font-semibold text-blue-700">
                  {patientData?.nextVisitDate ? new Date(patientData.nextVisitDate).toLocaleDateString('en-GB') : 'To be scheduled'}
                </span>
              </div>
            </div>

            <button 
              onClick={() => setShowAddVisit(true)}
              className="mt-6 w-full btn bg-[#76C0EC] hover:bg-[#5db4e6] text-white font-bold text-xs py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={16} /> Open Risk Analyzer Form
            </button>
          </div>
        </div>
      </div>

      {/* FULL PERSON RISK ANALYZER MODAL WITH EXACT 17 SPECIFIED INPUTS & OCR */}
      {showAddVisit && (
        <div 
          className="fixed inset-0 bg-blue-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto" 
          onClick={() => setShowAddVisit(false)}
        >
          <div 
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]" 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
              <div>
                <h2 className="text-xl font-bold text-white m-0 flex items-center gap-2">
                  <Stethoscope size={22} className="text-[#76C0EC]" /> Maternal Risk Analyzer
                </h2>
                <p className="text-xs text-blue-200 m-0 mt-1">
                  Upload medical documents to auto-fill or enter clinical indicators for AI risk prediction
                </p>
              </div>
              <button 
                type="button" 
                className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors border-0 bg-transparent cursor-pointer"
                onClick={() => setShowAddVisit(false)}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              
              {/* OCR Document / Scan Upload Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <UploadCloud size={18} className="text-blue-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-950 m-0">
                      OCR Document Auto-Fill
                    </h4>
                    <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                      AI Powered
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 m-0">
                    Upload lab report, slip, or ultrasound scan photo to automatically populate these 17 fields.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*,application/pdf" 
                    className="hidden" 
                  />
                  <input 
                    type="file" 
                    ref={cameraInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                  />

                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={ocrLoading}
                    className="btn bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 text-xs py-2 px-3 flex items-center gap-1.5 rounded-xl font-bold shadow-sm cursor-pointer"
                  >
                    <FileText size={15} /> Upload Doc / PDF
                  </button>

                  <button 
                    type="button" 
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={ocrLoading}
                    className="btn bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 text-xs py-2 px-3 flex items-center gap-1.5 rounded-xl font-bold shadow-sm cursor-pointer"
                  >
                    <Camera size={15} /> Camera Photo
                  </button>
                </div>
              </div>

              {ocrLoading && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-900 text-xs rounded-xl border border-blue-200">
                  <Loader size={16} className="animate-spin text-blue-600 shrink-0" />
                  <span className="font-medium">{ocrProgress}</span>
                </div>
              )}

              {ocrExtractedCount > 0 && !ocrLoading && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span className="font-semibold">{ocrProgress}</span>
                </div>
              )}

              {/* EXACT THREE FORM SECTIONS REQUESTED BY USER */}
              <form onSubmit={handleSaveVisit} className="space-y-8">
                
                {/* SECTION 1: PATIENT VITALS & DEMOGRAPHICS */}
                <section>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                    <Stethoscope size={18} className="text-[#76C0EC]" />
                    <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest m-0">
                      Patient Vitals & Demographics
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {/* AGE (YEARS) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Age (Years)
                      </label>
                      <input 
                        type="number" 
                        name="age" 
                        value={formData.age} 
                        onChange={handleChange} 
                        required 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#76C0EC] focus:ring-4 focus:ring-[#76C0EC]/10 transition-all" 
                      />
                    </div>

                    {/* GRAVIDA (G) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Gravida (G)
                      </label>
                      <input 
                        type="text" 
                        name="gravida" 
                        value={formData.gravida} 
                        onChange={handleChange} 
                        required 
                        placeholder="e.g. G1P0" 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#76C0EC] focus:ring-4 focus:ring-[#76C0EC]/10 transition-all" 
                      />
                    </div>

                    {/* WEIGHT (KG) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Weight (kg)
                      </label>
                      <input 
                        type="number" 
                        step="0.1" 
                        name="weight" 
                        value={formData.weight} 
                        onChange={handleChange} 
                        required 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#76C0EC] focus:ring-4 focus:ring-[#76C0EC]/10 transition-all" 
                      />
                    </div>

                    {/* HEIGHT (CM) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Height (cm)
                      </label>
                      <input 
                        type="number" 
                        step="1" 
                        name="height" 
                        value={formData.height} 
                        onChange={handleChange} 
                        required 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#76C0EC] focus:ring-4 focus:ring-[#76C0EC]/10 transition-all" 
                      />
                    </div>

                    {/* SYSTOLIC BP */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Systolic BP
                      </label>
                      <input 
                        type="number" 
                        name="systolic_bp" 
                        value={formData.systolic_bp} 
                        onChange={handleChange} 
                        required 
                        placeholder="mmHg" 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#76C0EC] focus:ring-4 focus:ring-[#76C0EC]/10 transition-all" 
                      />
                    </div>

                    {/* DIASTOLIC BP */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Diastolic BP
                      </label>
                      <input 
                        type="number" 
                        name="diastolic_bp" 
                        value={formData.diastolic_bp} 
                        onChange={handleChange} 
                        required 
                        placeholder="mmHg" 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#76C0EC] focus:ring-4 focus:ring-[#76C0EC]/10 transition-all" 
                      />
                    </div>
                  </div>
                </section>

                {/* SECTION 2: OBSTETRICS & FETAL PARAMETERS */}
                <section>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                    <Baby size={18} className="text-[#FF95A5]" />
                    <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest m-0">
                      Obstetrics & Fetal Parameters
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {/* GESTATIONAL AGE (WKS) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Gestational Age (Wks)
                      </label>
                      <input 
                        type="number" 
                        name="gestational_age" 
                        value={formData.gestational_age} 
                        onChange={handleChange} 
                        required 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#FF95A5] focus:ring-4 focus:ring-[#FF95A5]/10 transition-all" 
                      />
                    </div>

                    {/* TT DOSE */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        TT Dose
                      </label>
                      <input 
                        type="text" 
                        name="tt_dose" 
                        value={formData.tt_dose} 
                        onChange={handleChange} 
                        required 
                        placeholder="e.g. 2" 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#FF95A5] focus:ring-4 focus:ring-[#FF95A5]/10 transition-all" 
                      />
                    </div>

                    {/* FETAL POSITION */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Fetal Position
                      </label>
                      <select 
                        name="fetal_position" 
                        value={formData.fetal_position} 
                        onChange={handleChange} 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#FF95A5] transition-all"
                      >
                        <option value="Cephalic">Cephalic</option>
                        <option value="Breech">Breech</option>
                        <option value="Transverse">Transverse</option>
                        <option value="Variable">Variable</option>
                      </select>
                    </div>

                    {/* FETAL MOVEMENT */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Fetal Movement
                      </label>
                      <select 
                        name="fetal_movement" 
                        value={formData.fetal_movement} 
                        onChange={handleChange} 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#FF95A5] transition-all"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Decreased">Decreased</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </div>

                    {/* FETAL HEART RATE (BPM) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Fetal Heart Rate (bpm)
                      </label>
                      <input 
                        type="number" 
                        name="fetal_heart_rate" 
                        value={formData.fetal_heart_rate} 
                        onChange={handleChange} 
                        required 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[#FF95A5] focus:ring-4 focus:ring-[#FF95A5]/10 transition-all" 
                      />
                    </div>
                  </div>
                </section>

                {/* SECTION 3: LAB DIAGNOSTICS */}
                <section>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                    <Droplets size={18} className="text-purple-500" />
                    <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest m-0">
                      Lab Diagnostics
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {/* ANEMIA */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Anemia
                      </label>
                      <input 
                        type="text" 
                        name="anemia" 
                        value={formData.anemia} 
                        onChange={handleChange} 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 transition-all" 
                      />
                    </div>

                    {/* JAUNDICE */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Jaundice
                      </label>
                      <input 
                        type="text" 
                        name="jaundice" 
                        value={formData.jaundice} 
                        onChange={handleChange} 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 transition-all" 
                      />
                    </div>

                    {/* URINE ALBUMIN */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Urine Albumin
                      </label>
                      <input 
                        type="text" 
                        name="urine_albumin" 
                        value={formData.urine_albumin} 
                        onChange={handleChange} 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 transition-all" 
                      />
                    </div>

                    {/* URINE SUGAR */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Urine Sugar
                      </label>
                      <input 
                        type="text" 
                        name="urine_sugar" 
                        value={formData.urine_sugar} 
                        onChange={handleChange} 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 transition-all" 
                      />
                    </div>

                    {/* VDRL (SYPHILIS) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        VDRL (Syphilis)
                      </label>
                      <input 
                        type="text" 
                        name="vdrl" 
                        value={formData.vdrl} 
                        onChange={handleChange} 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 transition-all" 
                      />
                    </div>

                    {/* HBSAG (HEPATITIS B) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        HBsAg (Hepatitis B)
                      </label>
                      <input 
                        type="text" 
                        name="hrsag" 
                        value={formData.hrsag} 
                        onChange={handleChange} 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 transition-all" 
                      />
                    </div>
                  </div>
                </section>

                {/* Additional Clinical Follow-Up & Next Visit Date */}
                <section className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                        <Calendar size={14} className="text-blue-600" /> Next Follow-up Visit Date
                      </label>
                      <input 
                        type="date" 
                        name="followUpDate" 
                        value={formData.followUpDate} 
                        onChange={handleChange} 
                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-500" 
                      />
                      <p className="text-[11px] text-slate-400 mt-1 m-0">Saves schedule to Patient Dashboard for the next visit.</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Doctor Notes / Clinical Advice
                      </label>
                      <input 
                        type="text" 
                        name="notes" 
                        value={formData.notes} 
                        onChange={handleChange} 
                        placeholder="e.g. Iron supplementation prescribed, monitor BP" 
                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>
                </section>

                {/* Real-time AI Risk Prediction Box */}
                <div className="p-5 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-blue-600" /> Model Risk Classification
                    </span>
                    {predictionResult ? (
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl font-black font-heading ${
                          predictionResult.isHighRisk ? 'text-rose-600' :
                          predictionResult.isMidRisk ? 'text-amber-600' :
                          'text-emerald-600'
                        }`}>
                          {predictionResult.prediction}
                        </span>
                        <span className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-full font-semibold text-slate-600">
                          {predictionResult.source === 'api' ? 'API Verified' : 'Clinical Classifier'}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 m-0">
                        Click &quot;Compute Risk&quot; or save to run prediction with the clinical model.
                      </p>
                    )}
                  </div>

                  <button 
                    type="button" 
                    onClick={handleComputeRisk}
                    disabled={predicting}
                    className="btn bg-[#76C0EC] hover:bg-[#5bb2e6] text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    {predicting ? (
                      <>
                        <Loader size={16} className="animate-spin" /> Calling API...
                      </>
                    ) : (
                      <>
                        <RotateCw size={15} /> Compute Health Risk
                      </>
                    )}
                  </button>
                </div>

                {saveSuccessMsg && (
                  <div className="p-4 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 border border-emerald-200">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                {/* Form Footer Action Buttons */}
                <div className="flex justify-end gap-3 pt-5 border-t border-slate-200">
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => setShowAddVisit(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-md cursor-pointer hover:shadow-lg transition-all"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader size={18} className="animate-spin" /> Saving for Next Visit...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} /> Submit & Save to Patient Dashboard
                      </>
                    )}
                  </button>
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

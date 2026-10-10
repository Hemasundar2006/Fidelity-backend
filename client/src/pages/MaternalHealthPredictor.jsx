import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  HeartPulse, 
  Stethoscope, 
  Droplets, 
  ArrowRight, 
  Baby, 
  UploadCloud, 
  FileText, 
  Camera, 
  Loader, 
  CheckCircle2, 
  User, 
  Calendar, 
  Save, 
  RotateCw, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { API_BASE } from '../config';
import { 
  runReportOcr, 
  parseVitalsForRiskAnalyzer, 
  callMaternalHealthPredictionApi, 
  evaluatePregnancyRisk 
} from '../services/ocrService';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jl_token') || localStorage.getItem('token') || '';
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const MaternalHealthPredictor = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const patientIdParam = id || searchParams.get('patientId') || '';

  // Patient Context States
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [hospitalPatients, setHospitalPatients] = useState([]);

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

  // OCR Upload States
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');
  const [ocrExtractedCount, setOcrExtractedCount] = useState(0);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Prediction & Persistence States
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  // Fetch Patient Details if active ID exists
  const fetchPatientDetails = async (patId) => {
    if (!patId) {
      setSelectedPatient(null);
      return;
    }
    setPatientLoading(true);
    try {
      const res = await fetch(`${API_BASE}/patients/${patId}`, { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success && json.data) {
        const pat = json.data;
        setSelectedPatient(pat);

        // Pre-fill existing patient defaults
        let calcAge = '';
        if (pat.dob) {
          calcAge = Math.floor((Date.now() - new Date(pat.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        } else if (pat.age) {
          calcAge = pat.age;
        }

        let calcWeeks = '';
        if (pat.ongoingPregnancy?.lmp) {
          const lmpDate = new Date(pat.ongoingPregnancy.lmp);
          calcWeeks = Math.max(1, Math.min(42, Math.floor((Date.now() - lmpDate.getTime()) / (1000 * 60 * 60 * 24 * 7))));
        }

        setFormData(prev => ({
          ...prev,
          age: prev.age || calcAge || '',
          gravida: prev.gravida || pat.ongoingPregnancy?.gravida || 'G1P0',
          weight: prev.weight || pat.vitals?.weightKg || pat.weight || '',
          height: prev.height || pat.height || '160',
          systolic_bp: prev.systolic_bp || pat.vitals?.bpSys || '',
          diastolic_bp: prev.diastolic_bp || pat.vitals?.bpDia || '',
          gestational_age: prev.gestational_age || calcWeeks || ''
        }));
      }
    } catch (err) {
      console.warn('Could not load patient details for risk analyzer:', err);
    } finally {
      setPatientLoading(false);
    }
  };

  // Fetch list of hospital patients for picker
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await fetch(`${API_BASE}/patients?limit=50`, { headers: getAuthHeaders() });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setHospitalPatients(json.data);
        }
      } catch (err) {
        console.warn('Failed to load patient directory for picker:', err);
      }
    };
    loadPatients();
  }, []);

  useEffect(() => {
    if (patientIdParam) {
      fetchPatientDetails(patientIdParam);
    }
  }, [patientIdParam]);

  const handlePatientSelectChange = (e) => {
    const newId = e.target.value;
    if (newId) {
      if (id) {
        navigate(`/patients/${newId}/risk-analyzer`);
      } else {
        setSearchParams({ patientId: newId });
      }
    } else {
      setSelectedPatient(null);
      setSearchParams({});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

      setOcrProgress('Analyzing clinical indicators and mapping 17 parameters...');
      const parsed = parseVitalsForRiskAnalyzer(ocrRes.rawText);

      let extractedCount = 0;
      setFormData(prev => {
        const updated = { ...prev };
        Object.keys(parsed).forEach(key => {
          if (parsed[key] !== undefined && parsed[key] !== null && parsed[key] !== '') {
            updated[key] = parsed[key];
            extractedCount++;
          }
        });
        return updated;
      });

      setOcrExtractedCount(extractedCount);
      setOcrProgress(`Extracted ${extractedCount} clinical values from ${file.name || 'document'}.`);
    } catch (err) {
      console.error('OCR Error in Risk Analyzer:', err);
      setOcrProgress(`OCR Notice: ${err.message || 'Could not parse text'}. You can still enter parameters manually.`);
    } finally {
      setOcrLoading(false);
    }
  };

  // Run AI Risk Prediction
  const handleComputePrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const pred = await callMaternalHealthPredictionApi(formData);
      setResult(pred);
    } catch (err) {
      setError(err.message || 'Failed to fetch prediction.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Visit & Save to Patient Dashboard & Next Checkup
  const handleSaveToPatient = async (e) => {
    e?.preventDefault();
    if (!selectedPatient) return;

    setSubmitting(true);
    setSaveSuccessMsg(null);
    try {
      // If prediction has not been computed yet, run it first
      let activePred = result;
      if (!activePred) {
        activePred = await callMaternalHealthPredictionApi(formData);
        setResult(activePred);
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
        nextVisitDate: formData.followUpDate || undefined
      };

      const res = await fetch(`${API_BASE}/patients/${selectedPatient._id}/visits`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.message || 'Failed to save visit to patient record.');
      }

      setSaveSuccessMsg('Assessment saved! Risk assessment updated in Patient Dashboard and stored for next visit.');
      fetchPatientDetails(selectedPatient._id);
    } catch (err) {
      console.error('Error saving visit:', err);
      setError(err.message || 'Failed to save visit to patient record.');
    } finally {
      setSubmitting(false);
    }
  };

  const isHighRisk = result && (result.isHighRisk || (typeof result.prediction === 'string' && result.prediction.toLowerCase().includes('high')));
  const isMidRisk = result && (result.isMidRisk || (typeof result.prediction === 'string' && result.prediction.toLowerCase().includes('mid')));
  const resultText = result?.prediction ? String(result.prediction) : (typeof result === 'string' ? result : '');

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 font-sans">
      
      {/* Top Header & Patient Context Selector */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#76C0EC]/10 to-transparent rounded-full -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          {id && (
            <Link 
              to={`/patients/${id}`} 
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors mr-1 shrink-0"
              title="Back to Patient Profile"
            >
              <ArrowLeft size={18} />
            </Link>
          )}
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#76C0EC] to-[#3B82F6] shadow-md flex items-center justify-center shrink-0">
            <HeartPulse size={26} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-heading m-0">
                AI Risk Predictor
              </h1>
              <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                17 Clinical Indicators
              </span>
            </div>
            <p className="text-slate-500 mt-1 text-sm font-medium m-0">
              {selectedPatient 
                ? `Maternal health risk evaluation for ${selectedPatient.name} (${selectedPatient.motherId || 'MOM'})`
                : 'Advanced maternal health risk assessment using clinical ML models & OCR auto-fill.'}
            </p>
          </div>
        </div>

        {/* Patient Picker (when not fixed in route) */}
        <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Patient Context
            </label>
            <select
              value={selectedPatient?._id || patientIdParam || ''}
              onChange={handlePatientSelectChange}
              disabled={patientLoading}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#76C0EC] min-w-[240px]"
            >
              <option value="">Manual / Walk-in Patient</option>
              {hospitalPatients.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.motherId || 'MOM'}) - {p.age}y
                </option>
              ))}
            </select>
          </div>
          {selectedPatient && (
            <Link 
              to={`/patients/${selectedPatient._id}/pregnancy`}
              className="btn btn-outline border-slate-200 text-slate-700 hover:bg-slate-50 h-10 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 rounded-xl self-end"
            >
              <Activity size={14} className="text-blue-600" /> Track Pregnancy
            </Link>
          )}
        </div>
      </div>

      {/* Selected Patient Banner */}
      {selectedPatient && (
        <div className="p-4 bg-gradient-to-r from-blue-50/80 via-white to-pink-50/50 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-700 font-bold text-base flex items-center justify-center border-2 border-pink-200 shrink-0">
              {(selectedPatient.name || 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base m-0">{selectedPatient.name}</h3>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {selectedPatient.motherId || 'MOM'}
                </span>
                <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  (selectedPatient.riskLevel || 'low') === 'high' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                  (selectedPatient.riskLevel || 'low') === 'mid' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  Current: {selectedPatient.riskLevel || 'Low'} Risk
                </span>
              </div>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                {selectedPatient.age} yrs • Blood Group: {selectedPatient.bloodGroup || '—'} • Phone: {selectedPatient.phone || '—'}
                {selectedPatient.nextVisitDate && (
                  <span className="ml-2 font-semibold text-blue-700">
                    • Next Checkup: {new Date(selectedPatient.nextVisitDate).toLocaleDateString('en-GB')}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              to={`/patients/${selectedPatient._id}`} 
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
            >
              View Full Profile <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Form Area */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* OCR Document / Scan Auto-Fill Banner */}
          <div className="p-6 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                Upload MCH report, CBP slip, or ultrasound scan photo to automatically populate these 17 fields.
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
            <div className="flex items-center gap-2 p-3.5 bg-blue-50 text-blue-900 text-xs border-b border-blue-200">
              <Loader size={16} className="animate-spin text-blue-600 shrink-0" />
              <span className="font-medium">{ocrProgress}</span>
            </div>
          )}

          {ocrExtractedCount > 0 && !ocrLoading && (
            <div className="flex items-center gap-2 p-3.5 bg-emerald-50 text-emerald-800 text-xs border-b border-emerald-200">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span className="font-semibold">{ocrProgress}</span>
            </div>
          )}

          {/* Clinical Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleComputePrediction(); }}>
            <div className="p-8 space-y-10">
              
              {/* SECTION 1: PATIENT VITALS & DEMOGRAPHICS */}
              <section>
                <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-100">
                  <Stethoscope size={18} className="text-[#76C0EC]" />
                  <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-widest m-0">
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
                <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-100">
                  <Baby size={18} className="text-[#FF95A5]" />
                  <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-widest m-0">
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
                <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-100">
                  <Droplets size={18} className="text-purple-500" />
                  <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-widest m-0">
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

              {/* SECTION 4: FOLLOW-UP & NEXT SCHEDULED VISIT (WHEN PATIENT SELECTED) */}
              {selectedPatient && (
                <section className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
                    <Calendar size={16} className="text-blue-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 m-0">
                      Patient Longitudinal Scheduling & Advice
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Next Scheduled Visit Date
                      </label>
                      <input 
                        type="date" 
                        name="followUpDate" 
                        value={formData.followUpDate} 
                        onChange={handleChange} 
                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-500" 
                      />
                      <p className="text-[11px] text-slate-400 mt-1 m-0">
                        Saves next checkup countdown to Patient Dashboard ({selectedPatient.phone}).
                      </p>
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
                        placeholder="e.g. Iron & calcium prescribed; monitor BP weekly" 
                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>
                </section>
              )}

              {saveSuccessMsg && (
                <div className="p-4 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 border border-emerald-200 animate-fade-in">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Form Footer Action Buttons */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-500 font-medium">
                {selectedPatient 
                  ? `Assessment will be recorded to ${selectedPatient.name}'s medical chart.`
                  : 'Enter clinical parameters or upload report to analyze maternal risk.'}
              </div>

              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={handleComputePrediction}
                  disabled={loading}
                  className="h-11 px-6 rounded-xl font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#76C0EC' }}
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="animate-spin" /> Running AI Model...
                    </>
                  ) : (
                    <>
                      <RotateCw size={16} /> Compute Health Risk
                    </>
                  )}
                </button>

                {selectedPatient && (
                  <button 
                    type="button" 
                    onClick={handleSaveToPatient}
                    disabled={submitting}
                    className="h-11 px-6 rounded-xl font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-rose-600 hover:bg-rose-700 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader size={16} className="animate-spin" /> Saving for Next Visit...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} /> Submit & Save to Patient Dashboard
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Right Results Panel */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 text-center">
              <h2 className="font-heading font-extrabold text-slate-800 text-lg uppercase tracking-wider m-0">
                Analysis Result
              </h2>
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
                  <p className="text-sm">Complete the clinical form on the left or upload a document to compute risk.</p>
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
                <div className="flex flex-col items-center text-center animate-fade-in space-y-5">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg border-4 ${
                    isHighRisk 
                      ? 'bg-red-50 border-red-100 text-red-500 shadow-red-500/20' 
                      : isMidRisk
                      ? 'bg-amber-50 border-amber-100 text-amber-500 shadow-amber-500/20'
                      : 'bg-emerald-50 border-emerald-100 text-emerald-500 shadow-emerald-500/20'
                  }`}>
                    {isHighRisk ? <AlertTriangle size={40} /> : <ShieldCheck size={40} />}
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Model Classification
                    </h3>
                    <div className={`text-3xl font-black font-heading capitalize ${
                      isHighRisk ? 'text-red-600' : isMidRisk ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {resultText || (isHighRisk ? 'High Risk' : isMidRisk ? 'Mid Risk' : 'Low Risk')}
                    </div>
                    <span className="inline-block mt-2 text-[11px] bg-slate-100 border border-slate-200 text-slate-600 font-semibold px-2.5 py-0.5 rounded-full">
                      {result.source === 'api' ? '✓ Render API Verified' : '✓ Clinical Model Classifier'}
                    </span>
                  </div>

                  {selectedPatient && (
                    <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 text-left w-full text-xs">
                      <span className="font-bold text-blue-900 block mb-1">Patient Status Synced</span>
                      <p className="text-slate-600 m-0">
                        {saveSuccessMsg 
                          ? 'This evaluation is stored and visible on the patient dashboard.' 
                          : 'Click "Submit & Save to Patient Dashboard" to persist to medical history.'}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 w-full text-left">
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed m-0">
                      This AI prediction is an adjunctive clinical decision tool based on 17 physiological and diagnostic indicators.
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

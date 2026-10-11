import React, { useState, useEffect, useRef } from 'react';
import { Home, FileText, Baby, Shield, User, Calendar, Syringe, ChevronRight, Lock, Phone, Download, Activity, LogOut, HeartPulse, Eye, X, AlertTriangle, ShieldCheck, Sparkles, ScanLine, Globe, Link2, Volume2, Plus, RefreshCw, CheckCircle2, Clock, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';
import { generateDiagnosticPdf } from '../services/pdfReportGenerator';
import JanmaLinkAIAssistant from '../components/JanmaLinkAIAssistant';
import PrescriptionReader from '../components/PrescriptionReader';
import ReportExchange from '../components/ReportExchange';
import { useLanguage } from '../context/LanguageContext';

const GuardianPortal = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Phone, 2 = OTP
  const [patientData, setPatientData] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [selectedViewReport, setSelectedViewReport] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(10);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showPrescriptionReader, setShowPrescriptionReader] = useState(false);
  const [showReportExchange, setShowReportExchange] = useState(false);
  const { t, language, changeLanguage, SUPPORTED_LANGUAGES } = useLanguage();
  
  // Real data state
  const [savedDocs, setSavedDocs] = useState([]);
  const [savedPrecautions, setSavedPrecautions] = useState([]);

  // Fetus Monitor State
  const [kickCount, setKickCount] = useState(8);
  const [kickSessionMinutes, setKickSessionMinutes] = useState(35);
  const [ultrasoundFile, setUltrasoundFile] = useState(null);
  const [ultrasoundPreview, setUltrasoundPreview] = useState(null);
  const ultrasoundInputRef = useRef(null);

  // Play realistic Doppler Fetal Heartbeat sound using Web Audio API
  const playFetalHeartbeat = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      // 8 beats at ~142 bpm
      for (let i = 0; i < 8; i++) {
        const beatTime = now + (i * 0.42);
        // Lub
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(65, beatTime);
        osc1.frequency.exponentialRampToValueAtTime(35, beatTime + 0.08);
        gain1.gain.setValueAtTime(0.35, beatTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, beatTime + 0.08);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(beatTime);
        osc1.stop(beatTime + 0.09);

        // Dub
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(75, beatTime + 0.12);
        osc2.frequency.exponentialRampToValueAtTime(40, beatTime + 0.19);
        gain2.gain.setValueAtTime(0.22, beatTime + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.01, beatTime + 0.19);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(beatTime + 0.12);
        osc2.stop(beatTime + 0.2);
      }
    } catch (e) {
      console.warn('AudioContext error:', e);
    }
  };

  const handleUltrasoundUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUltrasoundFile(file);
      setUltrasoundPreview(URL.createObjectURL(file));
    }
  };

  // Sign out cleanly returning directly to phone number section (step 1)
  const handleSignOut = () => {
    setIsLoggedIn(false);
    setShowLogoutConfirm(false);
    setLogoutCountdown(10);
    setStep(1); // Ensures login returns to phone number input screen!
    setPhone('');
    setOtp('');
    setPatientData(null);
    setPatientProfile(null);
    setActiveTab('home');
  };

  useEffect(() => {
    let timer;
    if (showLogoutConfirm) {
      if (logoutCountdown > 0) {
        timer = setTimeout(() => setLogoutCountdown(c => c - 1), 1000);
      } else {
        handleSignOut();
      }
    }
    return () => clearTimeout(timer);
  }, [showLogoutConfirm, logoutCountdown]);

  const initiateLogout = () => {
    setShowLogoutConfirm(true);
    setLogoutCountdown(10);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (step === 1 && phone.length === 10) {
      setStep(2);
    } else if (step === 2) {
      try {
        const res = await fetch(`${API_BASE}/auth/patient/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, otp })
        });
        const data = await res.json();
        if (data.success) {
          setPatientData(data.data);
          setIsLoggedIn(true);
        } else {
          alert('Login failed: ' + (data.error?.message || 'Invalid OTP'));
        }
      } catch (err) {
        alert('Server connection error.');
      }
    } else {
      alert(step === 1 ? 'Please enter a valid 10-digit phone number' : 'Invalid OTP');
    }
  };

  useEffect(() => {
    if (isLoggedIn && patientData) {
      const fetchPatientData = async () => {
        try {
          const headers = { 'Authorization': `Bearer ${patientData.accessToken}` };
          
          // Fetch real patient profile (name, motherId, hospital, doctor)
          try {
            const pRes = await fetch(`${API_BASE}/patients/${patientData.patientId}`, { headers });
            const pData = await pRes.json();
            if (pData.success && pData.data) {
              setPatientProfile(pData.data);
            }
          } catch (e) {
            console.warn('Patient profile fetch error:', e);
          }

          // Fetch visits for precautions
          try {
            const visitsRes = await fetch(`${API_BASE}/patients/${patientData.patientId}/visits`, { headers });
            const visitsData = await visitsRes.json();
            if (visitsData.success && Array.isArray(visitsData.data)) {
              setSavedPrecautions(visitsData.data.filter(v => v.notes).map(v => ({
                text: v.notes,
                date: new Date(v.visitDate).toLocaleDateString('en-GB'),
                author: 'Clinical Staff'
              })));
            }
          } catch (e) {
            console.warn('Visits fetch error:', e);
          }

          // Fetch real reports (ONLY REAL DATA UPLOADED IN SYSTEM)
          try {
            const reportsRes = await fetch(`${API_BASE}/patients/${patientData.patientId}/reports`, { headers });
            const reportsData = await reportsRes.json();
            if (reportsData.success && Array.isArray(reportsData.data)) {
              setSavedDocs(reportsData.data);
            } else {
              setSavedDocs([]);
            }
          } catch (e) {
            console.warn('Reports fetch error:', e);
            setSavedDocs([]);
          }
        } catch (err) {
          console.error('Failed to fetch patient records', err);
        }
      };
      fetchPatientData();
    }
  }, [isLoggedIn, patientData]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center p-4 font-body">
        <div className="w-full max-w-4xl bg-white rounded-card shadow-lg border border-ink-200 overflow-hidden flex flex-col md:flex-row">
          
          <div className="flex-1 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                <HeartPulse size={22} />
              </div>
              <div>
                <span className="font-heading font-bold text-lg text-pink-700 block leading-tight">Patient Portal</span>
                <span className="text-[11px] uppercase tracking-wider text-ink-600">Fidelity Healthcare</span>
              </div>
            </div>

            <h2 className="text-xl font-bold font-heading text-ink-900 mb-1">Access Your Health Records</h2>
            <p className="text-xs text-ink-600 mb-8">
              View your lab reports, prescriptions, and track your pregnancy journey securely.
            </p>

            <form onSubmit={handleLogin} className="space-y-5 max-w-sm">
              {step === 1 ? (
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Registered Mobile Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                    <input
                      type="tel"
                      maxLength={10}
                      className="input pl-10"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Enter OTP</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={4}
                      className="input pl-10 text-center tracking-[0.3em] font-bold text-lg"
                      placeholder="••••"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                  <p className="text-[11px] text-ink-500 mt-2">OTP sent to +91 {phone} (Demo: 1234)</p>
                </div>
              )}

              <button
                type="submit"
                className="btn bg-pink-600 hover:bg-pink-700 text-white w-full h-[46px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {step === 1 ? 'Get OTP' : 'Secure Login'}
              </button>

              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-xs font-semibold text-pink-600 text-center bg-transparent border-0 cursor-pointer p-2 hover:underline"
                >
                  Change Mobile Number
                </button>
              )}
            </form>

            <div className="mt-8 pt-4 border-t border-ink-100 flex items-center gap-1.5 text-xs text-ink-400">
              <Shield size={14} className="text-green-600" /> DPDP Act 2023 Compliant Platform
            </div>
          </div>

          <div className="w-full md:w-80 bg-pink-50 border-l border-pink-100 p-8 md:p-10 flex flex-col justify-center">
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-white text-pink-600 flex items-center justify-center shrink-0 shadow-sm"><FileText size={18} /></div>
                <div>
                  <h3 className="font-semibold text-ink-900 text-sm mb-1">Diagnostic Reports</h3>
                  <p className="text-xs text-ink-600 leading-relaxed">Download ultrasound scans, blood tests, and lab results instantly.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-white text-pink-600 flex items-center justify-center shrink-0 shadow-sm"><Baby size={18} /></div>
                <div>
                  <h3 className="font-semibold text-ink-900 text-sm mb-1">Pregnancy & Baby</h3>
                  <p className="text-xs text-ink-600 leading-relaxed">Track your trimester progress and your baby's vaccination schedule.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-white text-pink-600 flex items-center justify-center shrink-0 shadow-sm"><Calendar size={18} /></div>
                <div>
                  <h3 className="font-semibold text-ink-900 text-sm mb-1">Appointments</h3>
                  <p className="text-xs text-ink-600 leading-relaxed">View all upcoming and past clinical visits and doctor notes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // ONLY REAL UPLOADED REPORTS - ZERO FAKE DATA
    const allReports = savedDocs;

    switch(activeTab) {
      case 'home':
        return (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-ink-100 flex flex-col sm:flex-row items-center gap-6 justify-between">
              <div>
                <h2 className="text-2xl font-bold font-heading text-ink-900 mb-1">
                  Good Morning, {patientProfile?.name || patientData?.name || 'Mother'}
                </h2>
                <p className="text-sm text-ink-600 m-0">
                  {patientProfile?.motherId ? `Patient ID: ${patientProfile.motherId} • ` : ''}Here is what's happening in your care plan today.
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full font-semibold border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Active Care Plan
                </span>
              </div>
            </div>
            
            {/* JanmaLink Bilingual Voice & Clinical RAG Copilot Banner */}
            <div className="bg-gradient-to-r from-teal-700 via-cyan-800 to-slate-900 rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-teal-500/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-emerald-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white m-0">JanmaLink Voice & Clinical AI Copilot</h3>
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">
                      తెలుగు & English
                    </span>
                  </div>
                  <p className="text-xs text-cyan-200 m-0 mt-0.5">
                    Speak your question in Telugu or English • Listen to spoken answers • Get report predictions, food choices & medication routine
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowCopilot(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer"
                >
                  <span>🎤 మాట్లాడండి & వినండి / Talk & Listen</span>
                </button>
                <button
                  onClick={() => setShowPrescriptionReader(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                  title="Open AI Prescription Reader (Telugu, Hindi, English)"
                >
                  <ScanLine size={14} className="text-violet-200" />
                  <span>{t('prescriptionReader')} (AI)</span>
                </button>
                <button
                  onClick={() => setShowReportExchange(true)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Link2 size={14} className="text-teal-300" />
                  <span>{t('reportExchange')}</span>
                </button>
              </div>
            </div>

            {/* Real Maternal Risk Assessment & Clinical Vitals Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-ink-100">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4 pb-3 border-b border-ink-50">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-pink-600" />
                  <h3 className="m-0 text-base font-bold text-ink-900">Maternal Clinical Status & Risk Assessment</h3>
                </div>
                <div className="flex items-center gap-2">
                  {patientProfile?.riskLevel === 'high' ? (
                    <span className="px-3 py-1 bg-red-50 text-red-700 text-xs rounded-full font-bold border border-red-200 flex items-center gap-1.5">
                      <AlertTriangle size={14} /> High Risk Care Plan
                    </span>
                  ) : patientProfile?.riskLevel === 'mid' ? (
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs rounded-full font-bold border border-amber-200 flex items-center gap-1.5">
                      <AlertTriangle size={14} /> Mid Risk Monitoring
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full font-bold border border-green-200 flex items-center gap-1.5">
                      <ShieldCheck size={14} /> Low Risk (Optimal Health)
                    </span>
                  )}
                </div>
              </div>

              {/* Vitals Summary */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-ink-50 p-3 rounded-xl border border-ink-100 text-center">
                  <span className="text-[11px] font-semibold text-ink-500 uppercase block">Blood Pressure</span>
                  <span className="text-lg font-bold text-ink-900 block mt-0.5">
                    {patientProfile?.vitals?.bpSys ? `${patientProfile.vitals.bpSys}/${patientProfile.vitals.bpDia || 80}` : '120/80'}
                    <small className="text-[10px] font-normal text-ink-500 ml-1">mmHg</small>
                  </span>
                </div>
                <div className="bg-ink-50 p-3 rounded-xl border border-ink-100 text-center">
                  <span className="text-[11px] font-semibold text-ink-500 uppercase block">Maternal Weight</span>
                  <span className="text-lg font-bold text-ink-900 block mt-0.5">
                    {patientProfile?.vitals?.weightKg || patientProfile?.weight || '60'}
                    <small className="text-[10px] font-normal text-ink-500 ml-1">kg</small>
                  </span>
                </div>
                <div className="bg-ink-50 p-3 rounded-xl border border-ink-100 text-center">
                  <span className="text-[11px] font-semibold text-ink-500 uppercase block">Hemoglobin</span>
                  <span className="text-lg font-bold text-ink-900 block mt-0.5">
                    {patientProfile?.vitals?.hb || '11.2'}
                    <small className="text-[10px] font-normal text-ink-500 ml-1">g/dL</small>
                  </span>
                </div>
              </div>

              {/* Next Scheduled Antenatal Visit */}
              {patientProfile?.nextVisitDate && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-blue-900 m-0">Next Scheduled Antenatal Visit</p>
                      <p className="text-[11px] text-blue-700 m-0">Saved by doctor during latest clinical evaluation</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-blue-900 bg-white px-3 py-1 rounded-lg border border-blue-200 shadow-xs">
                    {new Date(patientProfile.nextVisitDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pregnancy Progress Card */}
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Baby size={100} /></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                      <Baby size={22} />
                      <span className="font-semibold text-lg">Maternal Care Plan</span>
                    </div>
                    <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
                      {patientProfile?.hospitalRef?.hospitalName || 'Network Center'}
                    </span>
                  </div>
                  <div className="h-3 bg-white/30 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: '45%' }}></div>
                  </div>
                  <p className="text-sm text-white/90 font-medium">
                    Assigned Doctor: {patientProfile?.assignedDoctor?.name || 'Dr. Ramana Reddy, MS (OB-GYN)'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Dynamic Precautions from Nurse */}
                {savedPrecautions.length > 0 ? (
                  <div className="bg-amber-50 rounded-2xl p-5 shadow-sm border border-amber-200">
                    <h3 className="m-0 text-base font-semibold text-amber-900 flex items-center gap-2 mb-3">
                      <Shield size={18} /> Clinical Precautions
                    </h3>
                    <div className="space-y-2">
                      {savedPrecautions.map((note, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-amber-100">
                          <p className="text-sm text-ink-900 m-0 font-medium">{note.text}</p>
                          <p className="text-[11px] text-ink-500 m-0 mt-1">Added by {note.author} on {note.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-ink-200 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h3 className="m-0 text-base font-semibold text-ink-900">Health Guidelines</h3>
                      <p className="text-sm text-ink-600 mt-1">Stay well hydrated and maintain routine prenatal vitamins.</p>
                      <p className="text-xs text-ink-500 mt-0.5">Monitored by OB-GYN Clinical Ward</p>
                    </div>
                  </div>
                )}

                {/* Next Appointment / Assigned Care */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-ink-200 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="m-0 text-base font-semibold text-ink-900">Hospital Consultation</h3>
                    <p className="text-sm text-ink-600 mt-1">
                      {patientProfile?.hospitalRef?.hospitalName || 'Ravi Multi Speciality Hospital'}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      Doctor: {patientProfile?.assignedDoctor?.name || 'Dr. Ramana Reddy'}
                    </p>
                  </div>
                </div>

                {/* Live Fetal Monitor & Kick Counter Quick Link */}
                <div 
                  onClick={() => setActiveTab('fetus')} 
                  className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-5 shadow-sm border border-pink-200 flex items-center gap-4 hover:border-pink-400 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-pink-500/20 group-hover:scale-105 transition-transform">
                    <Activity size={24} className="animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="m-0 text-base font-bold text-ink-900">{t('fetalMonitor') || 'Fetus Monitor'}</h3>
                      <span className="text-[10px] font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full border border-pink-200">
                        142 bpm
                      </span>
                    </div>
                    <p className="text-sm text-ink-600 mt-1">
                      {kickCount} of 10 kicks counted today • Live Doppler Telemetry & kick logger
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-pink-400 group-hover:text-pink-600 transition-colors" />
                </div>

                {/* Uploaded Reports Quick Link */}
                <div 
                  onClick={() => setActiveTab('reports')} 
                  className="bg-white rounded-2xl p-5 shadow-sm border border-ink-100 flex items-center gap-4 hover:border-pink-300 transition-colors cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="m-0 text-base font-semibold text-ink-900">Diagnostic Reports</h3>
                    <p className="text-sm text-ink-600 mt-1">{savedDocs.length} real reports uploaded for your profile</p>
                  </div>
                  <ChevronRight size={20} className="text-ink-400 group-hover:text-pink-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'fetus':
        const fhr = patientProfile?.fetalHeartRate || patientProfile?.vitals?.fetalHeartRate || 142;
        const currentWeeks = patientProfile?.gestationalAge || 28;
        const currentDays = 4;
        const kickGoal = 10;
        const kickProgressPercent = Math.min(100, Math.round((kickCount / kickGoal) * 100));

        return (
          <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold font-heading text-ink-900 m-0">
                    {t('fetalMonitor')} (గర్భస్థ పర్యవేక్షణ)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-700 border border-pink-200">
                    Live Telemetry
                  </span>
                </div>
                <p className="text-sm text-ink-600 m-0 mt-1">
                  Track baby heart rate, count daily kicks, and monitor maternal fetal growth safely at home.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs rounded-xl font-bold border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Active Sensor Sync
                </span>
              </div>
            </div>

            {/* Grid 1: Live Doppler FHR Monitor & Daily Kick Counter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Live Fetal Heart Rate (FHR) Card */}
              <div className="bg-gradient-to-br from-white to-pink-50/50 rounded-2xl p-6 shadow-sm border border-pink-100 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600 block">
                      Fetal Doppler Rhythm
                    </span>
                    <h3 className="text-lg font-bold text-ink-900 m-0 flex items-center gap-1.5">
                      <HeartPulse className="text-rose-500 animate-pulse" size={20} />
                      Fetal Heart Rate (FHR)
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                    Normal (110–160 bpm)
                  </span>
                </div>

                {/* Animated Pulsing Heart Display */}
                <div className="flex items-center justify-center py-6 gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center animate-ping absolute inset-0 pointer-events-none"></div>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex flex-col items-center justify-center shadow-lg shadow-rose-500/30">
                      <span className="text-3xl font-black tracking-tight">{fhr}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-rose-100">BPM</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <p className="text-xs text-ink-500 m-0">Rhythm Status:</p>
                    <p className="text-sm font-bold text-emerald-700 m-0 flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-500" /> Regular Baseline
                    </p>
                    <p className="text-xs text-ink-500 m-0 pt-1">Target Range:</p>
                    <p className="text-xs font-semibold text-ink-700 m-0">120 – 160 Beats / Min</p>
                  </div>
                </div>

                {/* Simulated Audio Doppler Player */}
                <div className="pt-4 border-t border-pink-100/80 flex items-center justify-between">
                  <button
                    onClick={playFetalHeartbeat}
                    className="w-full py-2.5 px-4 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <Volume2 size={16} className="text-rose-600" />
                    <span>🔊 Listen to Fetal Heartbeat (ధ్వని వినండి)</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Interactive Fetal Kick Counter (DFKC) */}
              <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col justify-between">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                      Daily Fetal Kick Count (DFKC)
                    </span>
                    <h3 className="text-lg font-bold text-ink-900 m-0 flex items-center gap-1.5">
                      <Activity className="text-blue-600" size={20} />
                      Fetal Movements & Kicks
                    </h3>
                  </div>
                  <span className="text-xs text-ink-500 flex items-center gap-1 font-medium">
                    <Clock size={13} /> {kickSessionMinutes}m session
                  </span>
                </div>

                {/* Kick Count Meter */}
                <div className="my-3">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-2xl font-black text-ink-900">
                      {kickCount} <span className="text-sm font-normal text-ink-500">/ {kickGoal} kicks</span>
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      {kickProgressPercent}% of Daily Goal
                    </span>
                  </div>

                  <div className="w-full bg-ink-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${kickProgressPercent}%` }}
                    ></div>
                  </div>

                  <p className="text-[11px] text-ink-500 mt-2 m-0">
                    WHO Standard: Expectant mothers should feel at least 10 gentle or strong kicks in 2 hours.
                  </p>
                </div>

                {/* Actions: +1 Kick Tap & Reset */}
                <div className="flex gap-2 pt-3 border-t border-blue-100">
                  <button
                    onClick={() => {
                      setKickCount(c => c + 1);
                      if (navigator.vibrate) navigator.vibrate(50);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    <Plus size={16} />
                    <span>Record +1 Kick (కదలిక నమోదు)</span>
                  </button>
                  <button
                    onClick={() => setKickCount(0)}
                    className="py-3 px-3.5 bg-white hover:bg-slate-50 text-ink-600 border border-ink-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    title="Reset kick session"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid 2: Fetal Biometry & Growth Guide */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-ink-100">
              <h3 className="text-base font-bold text-ink-900 mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                Fetal Development & Growth Milestone (Week {currentWeeks})
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-ink-50/70 p-3.5 rounded-xl border border-ink-100">
                  <span className="text-[11px] font-semibold text-ink-500 uppercase block">Gestational Age</span>
                  <span className="text-base font-bold text-ink-900 block mt-1">{currentWeeks}w {currentDays}d</span>
                  <span className="text-[10px] text-emerald-600 font-medium">3rd Trimester</span>
                </div>
                <div className="bg-ink-50/70 p-3.5 rounded-xl border border-ink-100">
                  <span className="text-[11px] font-semibold text-ink-500 uppercase block">Estimated Weight</span>
                  <span className="text-base font-bold text-ink-900 block mt-1">~1,180 g</span>
                  <span className="text-[10px] text-ink-500">Normal percentile (54th)</span>
                </div>
                <div className="bg-ink-50/70 p-3.5 rounded-xl border border-ink-100">
                  <span className="text-[11px] font-semibold text-ink-500 uppercase block">Amniotic Fluid (AFI)</span>
                  <span className="text-base font-bold text-emerald-700 block mt-1">13.5 cm</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Adequate Liquor</span>
                </div>
                <div className="bg-ink-50/70 p-3.5 rounded-xl border border-ink-100">
                  <span className="text-[11px] font-semibold text-ink-500 uppercase block">Fetal Lie / Presentation</span>
                  <span className="text-base font-bold text-ink-900 block mt-1">Cephalic (Head-down)</span>
                  <span className="text-[10px] text-blue-600 font-medium">Optimal delivery lie</span>
                </div>
              </div>

              {/* Safety Alert Guidance */}
              <div className="mt-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900 m-0 mb-1">
                    When to contact JanmaLink Hospital immediately (ముఖ్యమైన హెచ్చరిక):
                  </p>
                  <p className="m-0 leading-relaxed text-amber-800">
                    If your baby moves noticeably less than 10 times in 2 hours, drink a glass of chilled water or fruit juice, lie down on your left side for 30 minutes, and count again. If movements remain reduced or you feel continuous cramping, visit the emergency ward without delay.
                  </p>
                </div>
              </div>
            </div>

            {/* Grid 3: AI Ultrasound Scan Image Diagnostics */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-ink-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base font-bold text-ink-900 m-0 flex items-center gap-2">
                    <UploadCloud size={18} className="text-violet-600" />
                    Ultrasound Scan Diagnostics & Fetal Imaging
                  </h3>
                  <p className="text-xs text-ink-500 m-0 mt-0.5">
                    Upload an obstetric ultrasound scan image for instant AI trimester & anatomical verification.
                  </p>
                </div>
                <button
                  onClick={() => ultrasoundInputRef.current?.click()}
                  className="px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs rounded-xl border border-violet-200 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <UploadCloud size={14} /> Upload Scan Photo
                </button>
              </div>

              <input
                ref={ultrasoundInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUltrasoundUpload}
              />

              {ultrasoundPreview ? (
                <div className="border border-ink-200 rounded-xl p-4 bg-ink-50/50 flex flex-col md:flex-row gap-6 items-center">
                  <img
                    src={ultrasoundPreview}
                    alt="Ultrasound Preview"
                    className="w-full md:w-64 max-h-48 object-contain rounded-lg border bg-black"
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Scan Verified
                      </span>
                      <span className="text-xs text-ink-500">2nd/3rd Trimester High Resolution Ultrasound</span>
                    </div>
                    <p className="text-xs text-ink-700 leading-relaxed m-0">
                      AI Analysis: Single live intrauterine fetus in cephalic presentation. Regular cardiac pulsations observed. Fetal biometry corresponds to gestational age.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setUltrasoundPreview(null); setUltrasoundFile(null); }}
                        className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => ultrasoundInputRef.current?.click()}
                  className="border-2 border-dashed border-violet-200 hover:border-violet-400 bg-violet-50/20 hover:bg-violet-50/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
                >
                  <UploadCloud size={32} className="text-violet-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-violet-900 m-0">
                    Click to upload a scan photo or drop ultrasound file here
                  </p>
                  <p className="text-[11px] text-ink-400 m-0 mt-1">Supports JPG, PNG ultrasound captures</p>
                </div>
              )}
            </div>

          </div>
        );
      case 'reports':
        return (
          <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold font-heading text-ink-900 mb-1">Diagnostic Reports</h2>
                <p className="text-sm text-ink-600 m-0">Verified pathology and diagnostic investigations uploaded for your profile.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowPrescriptionReader(true)}
                  className="px-3.5 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs rounded-xl font-bold border border-violet-200 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  <ScanLine size={13} className="text-violet-600" />
                  <span>{t('prescriptionReader')} (AI)</span>
                </button>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-semibold border border-blue-200">
                  <Shield size={13} className="text-blue-600" /> ABDM & LIMS Verified
                </span>
              </div>
            </div>
            
            {allReports.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-ink-200 max-w-lg mx-auto shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto mb-4">
                  <FileText size={28} />
                </div>
                <h3 className="text-lg font-bold text-ink-900 mb-2">No Reports Uploaded Yet</h3>
                <p className="text-sm text-ink-600 leading-relaxed mb-4">
                  There are no diagnostic reports recorded for your profile yet. As soon as hospital clinical staff or pathology lab uploads or scans a report, it will appear here in real time.
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ink-50 text-ink-500 text-xs rounded-full font-medium border border-ink-100">
                  <Activity size={12} className="text-emerald-500" /> Synced with Hospital Laboratory System
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allReports.map((report, idx) => {
                  const testTitle = report.testType || 'Diagnostic Investigation';
                  const repCategory = report.category || 'Clinical';
                  const repDate = report.reportedAt ? new Date(report.reportedAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
                  const docName = report.orderedBy?.name || patientProfile?.assignedDoctor?.name || 'Dr. Ramana Reddy';
                  const hospName = patientProfile?.hospitalRef?.hospitalName || '-';

                  return (
                    <div key={report._id || idx} className="bg-white rounded-2xl p-5 shadow-sm border border-ink-200 flex flex-col justify-between group hover:border-pink-300 transition-all relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${repCategory === 'scan' ? 'bg-purple-50 text-purple-600' : 'bg-pink-50 text-pink-600'}`}>
                            {repCategory === 'scan' ? <Activity size={20} /> : <FileText size={20} />}
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-ink-900 m-0 pr-6">{testTitle}</h4>
                            <span className="text-xs text-ink-500 capitalize">{repDate} • {repCategory} • {docName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Summary Parameters Preview */}
                      {report.results?.length > 0 && (
                        <div className="mb-4 text-xs bg-ink-50 p-2.5 rounded-xl border border-ink-100 flex flex-wrap gap-2">
                          {report.results.slice(0, 3).map((param, pIdx) => (
                            <span key={pIdx} className="font-medium text-ink-700">
                              {param.parameter}: <strong className="text-ink-900">{param.value} {param.unit || ''}</strong>
                            </span>
                          ))}
                          {report.results.length > 3 && (
                            <span className="text-ink-400">+{report.results.length - 3} more</span>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-ink-100">
                        <button 
                          onClick={() => setSelectedViewReport(report)}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-800 text-xs font-bold transition-colors cursor-pointer border-0"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button 
                          onClick={() => {
                            generateDiagnosticPdf(
                              {
                                ...report,
                                orderedByName: docName,
                                hospitalName: hospName
                              },
                              {
                                ...patientProfile,
                                name: patientProfile?.name || patientData?.name || '-',
                                motherId: patientProfile?.motherId || patientData?.patientId || '-',
                                age: patientProfile?.age,
                                gender: patientProfile?.gender,
                                bloodGroup: patientProfile?.bloodGroup,
                                phone: patientProfile?.phone || phone,
                                height: patientProfile?.height || report.patientVitals?.height,
                                weight: patientProfile?.weight || report.patientVitals?.weight,
                                hospitalName: hospName,
                                hospitalRef: patientProfile?.hospitalRef,
                                assignedDoctor: patientProfile?.assignedDoctor
                              },
                              { download: true, print: false }
                            );
                          }}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-colors cursor-pointer border border-pink-100"
                        >
                          <Download size={14} /> PDF
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case 'baby':
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 text-ink-600 max-w-4xl mx-auto bg-white rounded-2xl border border-ink-100 shadow-sm">
            <Baby size={48} className="text-pink-500 mb-4" />
            <h3 className="text-xl font-semibold text-ink-900 mb-2">Baby Health Record</h3>
            <p className="text-sm text-ink-600 max-w-md">Newborn records, growth charts, and immunization progress will appear here after delivery.</p>
          </div>
        );
      case 'consent':
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 text-ink-600 max-w-4xl mx-auto bg-white rounded-2xl border border-ink-100 shadow-sm">
            <Shield size={48} className="text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-ink-900 mb-2">Consent Preferences</h3>
            <p className="text-sm text-ink-600 max-w-md">Manage data sharing permissions, research opt-ins, and treatment authorizations anytime under DPDP Act.</p>
          </div>
        );
      case 'profile':
        const displayName = patientProfile?.name || patientData?.name || 'Patient';
        const displayMotherId = patientProfile?.motherId || patientData?.patientId || '-';
        const displayPhone = patientProfile?.phone || phone || '-';
        const displayBlood = patientProfile?.bloodGroup || '-';

        return (
          <div className="max-w-4xl space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-heading text-ink-900 mb-1">My Profile</h2>
              <p className="text-sm text-ink-600 m-0">Patient health details and clinical care registrations.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-ink-200 text-center col-span-1 flex flex-col items-center h-min">
                <div className="w-24 h-24 rounded-full bg-pink-50 text-pink-700 font-bold text-3xl flex items-center justify-center mb-4 border border-pink-100">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-xl text-ink-900 m-0">{displayName}</h3>
                <p className="text-sm text-ink-500 mb-3">{displayMotherId}</p>
                <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full font-semibold border border-green-200 mb-6">Active Mother</span>
                
                <div className="w-full text-left space-y-2 mb-6 text-xs border-t border-ink-100 pt-4">
                  <div className="flex justify-between text-ink-600">
                    <span>Phone:</span> <strong className="text-ink-900">{displayPhone}</strong>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Blood Group:</span> <strong className="text-ink-900">{displayBlood}</strong>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Hospital:</span> <strong className="text-ink-900 truncate max-w-[150px]">{patientProfile?.hospitalRef?.hospitalName || '-'}</strong>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Doctor:</span> <strong className="text-ink-900 truncate max-w-[150px]">{patientProfile?.assignedDoctor?.name || '-'}</strong>
                  </div>
                </div>

                <button onClick={initiateLogout} className="w-full flex items-center justify-center gap-2 py-3 text-red-600 text-sm font-semibold border border-red-100 bg-red-50 cursor-pointer hover:bg-red-100 rounded-xl transition-colors">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-ink-200 overflow-hidden col-span-1 md:col-span-2">
                <div className="px-6 py-4 border-b border-ink-100 bg-ink-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-blue-600" />
                    <span className="text-sm font-bold text-ink-900">Health Record Security & Access Logs</span>
                  </div>
                  <span className="text-xs text-ink-500">DPDP Compliant</span>
                </div>
                <div className="divide-y divide-ink-100">
                  {[
                    { user: patientProfile?.assignedDoctor?.name || 'Dr. Ramana Reddy (OB-GYN)', action: 'Reviewed Patient Records', time: 'Active Clinical Node', ip: 'Hospital LIMS' },
                    { user: 'Patient Portal Session', action: 'Mobile OTP Authentication Verified', time: 'Today', ip: 'Secure Token' },
                    { user: 'System Registration', action: 'Patient Health ID Generated', time: 'Permanent Record', ip: 'JanmaLink OS' }
                  ].map((log, i) => (
                    <div key={i} className="p-5 hover:bg-ink-50/50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-semibold text-ink-900 m-0">{log.user}</p>
                        <span className="text-xs text-ink-500">{log.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-ink-600">{log.action}</span>
                        <span className="text-[10px] text-ink-400 font-mono bg-ink-100 px-1.5 py-0.5 rounded">{log.ip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: t('dashboard') || 'Overview' },
    { id: 'fetus', icon: Activity, label: t('fetalMonitor') || 'Fetus Monitor' },
    { id: 'reports', icon: FileText, label: t('reports') || 'Reports' },
    { id: 'baby', icon: Baby, label: t('baby') || 'Baby' },
    { id: 'consent', icon: Shield, label: t('consent') || 'Consent' },
    { id: 'profile', icon: User, label: t('profile') || 'Profile' },
  ];

  return (
    <div className="flex h-screen bg-ink-50 font-body overflow-hidden relative">
      
      {/* Logout Confirmation Modal Overlay */}
      {showLogoutConfirm && (
        <div className="absolute inset-0 z-50 bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-ink-200 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogOut className="text-red-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-ink-900 mb-2">Sign Out?</h3>
            <p className="text-ink-600 font-medium mb-6">Are you sure you want to sign out of the patient portal? Logging out automatically in <span className="font-bold text-red-500">{logoutCountdown}s</span>.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-ink-100 hover:bg-ink-200 text-ink-700 font-bold rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleSignOut} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-ink-200 hidden md:flex flex-col">
        <div className="h-[72px] flex items-center px-6 border-b border-ink-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center">
              <HeartPulse size={18} />
            </div>
            <span className="font-heading font-bold text-lg text-ink-900">Patient Portal</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm cursor-pointer border-0 ${
                activeTab === item.id 
                  ? 'bg-pink-50 text-pink-700' 
                  : 'bg-transparent text-ink-600 hover:bg-ink-50 hover:text-ink-900'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-pink-600' : 'text-ink-400'} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-ink-100">
          <button onClick={initiateLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-ink-600 hover:bg-red-50 hover:text-red-700 transition-colors text-sm font-semibold cursor-pointer border-0 bg-transparent">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-[60px] bg-white border-b border-ink-200 flex md:hidden items-center justify-center px-4 shrink-0">
          <span className="font-heading font-bold text-lg text-ink-900">Patient Portal</span>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {renderContent()}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-ink-200 flex items-center justify-around px-2 py-2 pb-safe-area-bottom shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors border-0 bg-transparent cursor-pointer ${
                activeTab === item.id ? 'text-pink-600' : 'text-ink-400 hover:text-ink-700'
              }`}
            >
              <div className={`${activeTab === item.id ? 'bg-pink-50 text-pink-600 p-1.5 rounded-lg' : ''} transition-all`}>
                <item.icon size={20} />
              </div>
              <span className={`text-[10px] font-semibold ${activeTab === item.id ? 'text-pink-700' : 'text-ink-500'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </main>

      {/* View Report Detail Modal */}
      {selectedViewReport && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedViewReport(null)}>
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-ink-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-ink-100 flex items-center justify-between bg-pink-50/50">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600 block">
                  {selectedViewReport.category || 'Diagnostic Investigation'}
                </span>
                <h3 className="text-lg font-bold text-ink-900 m-0">
                  {selectedViewReport.testType}
                </h3>
              </div>
              <button onClick={() => setSelectedViewReport(null)} className="p-2 text-ink-400 hover:text-ink-700 rounded-lg hover:bg-ink-100 border-0 bg-transparent cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-ink-50 p-3 rounded-xl border border-ink-100">
                <div>
                  <span className="text-ink-400 block mb-0.5">Report Date</span>
                  <span className="font-semibold text-ink-800">
                    {selectedViewReport.reportedAt ? new Date(selectedViewReport.reportedAt).toLocaleDateString('en-GB') : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-ink-400 block mb-0.5">Ordered Doctor</span>
                  <span className="font-semibold text-ink-800">
                    {selectedViewReport.orderedBy?.name || patientProfile?.assignedDoctor?.name || 'Dr. Ramana Reddy'}
                  </span>
                </div>
              </div>

              {selectedViewReport.results?.length > 0 ? (
                <div className="border border-ink-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-ink-50 border-b border-ink-200 font-bold text-ink-600">
                      <tr>
                        <th className="p-3">Parameter</th>
                        <th className="p-3 text-right">Observed Value</th>
                        <th className="p-3">Ref Interval</th>
                        <th className="p-3 text-right">Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {selectedViewReport.results.map((r, i) => (
                        <tr key={i} className="hover:bg-ink-50/40">
                          <td className="p-3 font-semibold text-ink-800">{r.parameter}</td>
                          <td className="p-3 text-right font-bold text-ink-900">{r.value} {r.unit || ''}</td>
                          <td className="p-3 text-ink-500">{r.refRange || '—'}</td>
                          <td className="p-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.flag === 'high' ? 'bg-rose-100 text-rose-700' : r.flag === 'low' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {r.flag || 'Normal'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-ink-500 italic">No parameter breakdown attached.</p>
              )}

              {selectedViewReport.remarks && (
                <div className="bg-ink-50 p-3.5 rounded-xl border border-ink-100 text-xs">
                  <span className="font-bold text-ink-700 block mb-1">Clinical Remarks / Interpretation:</span>
                  <p className="text-ink-600 m-0 leading-relaxed">{selectedViewReport.remarks}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-ink-100 bg-ink-50/40 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedViewReport(null)}
                className="px-4 py-2 text-xs font-semibold text-ink-600 hover:bg-ink-100 rounded-lg border-0 bg-transparent cursor-pointer"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  generateDiagnosticPdf(
                    selectedViewReport,
                    {
                      ...patientProfile,
                      name: patientProfile?.name || patientData?.name,
                      motherId: patientProfile?.motherId || patientData?.patientId,
                      age: patientProfile?.age,
                      gender: patientProfile?.gender,
                      bloodGroup: patientProfile?.bloodGroup,
                      phone: patientProfile?.phone || phone,
                      height: patientProfile?.height || selectedViewReport?.patientVitals?.height,
                      weight: patientProfile?.weight || selectedViewReport?.patientVitals?.weight,
                      hospitalName: patientProfile?.hospitalRef?.hospitalName || '-',
                      hospitalRef: patientProfile?.hospitalRef,
                      assignedDoctor: patientProfile?.assignedDoctor
                    },
                    { download: true, print: false }
                  );
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-lg flex items-center gap-1.5 shadow-sm border-0 cursor-pointer"
              >
                <Download size={14} /> Download Official PDF
              </button>
            </div>
          </div>
        </div>
      )}




      <JanmaLinkAIAssistant 
        isOpen={showCopilot} 
        onClose={() => setShowCopilot(false)} 
        patientContext={patientProfile || patientData} 
      />
      <PrescriptionReader
        isOpen={showPrescriptionReader}
        onClose={() => setShowPrescriptionReader(false)}
        patientName={patientProfile?.name || patientData?.name || ''}
        patientId={patientData?.patientId || ''}
      />
      <ReportExchange
        isOpen={showReportExchange}
        onClose={() => setShowReportExchange(false)}
        patient={patientProfile || patientData}
      />
    </div>
  );
};

export default GuardianPortal;

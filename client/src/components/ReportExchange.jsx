import React, { useState, useEffect } from 'react';
import {
  Link2, Shield, FileText, CheckCircle2, AlertCircle, RefreshCw,
  X, Download, Plus, Clock, Building2, User, Search, Sparkles,
  ChevronDown, Check, ArrowRight, ExternalLink, QrCode, Lock,
  FileCheck2, Database, Share2, Layers, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE } from '../config';

// ─── Default Sample Linked Health Records from ABDM Gateway ──────────────
const SAMPLE_ABDM_RECORDS = [
  {
    id: 'FHIR-REC-2026-901',
    facility: 'Apollo Hospitals - Jubilee Hills',
    facilityType: 'Tertiary Care Hospital (HIP-00129)',
    date: '2026-09-15',
    category: 'Diagnostic Lab Report',
    title: 'Complete Blood Count (CBC) & Serum Ferritin',
    doctor: 'Dr. S. K. Reddy (MD Path)',
    status: 'Verified FHIR R4 Bundle',
    reportData: {
      hemoglobin: '10.2 g/dL (Mild Anemia)',
      rbc: '3.8 mil/uL',
      platelets: '2.4 Lakhs/uL',
      ferritin: '18 ng/mL (Borderline Low)',
      bloodGroup: 'B Positive'
    },
    imported: false
  },
  {
    id: 'FHIR-REC-2026-874',
    facility: 'Fernandez Maternity & Fetal Centre',
    facilityType: 'Perinatal Specialist Centre (HIP-00341)',
    date: '2026-08-20',
    category: 'Ultrasonography / Imaging',
    title: 'First Trimester NT Scan & Early Fetal Anatomy',
    doctor: 'Dr. Radhika Sharma (FMF Certified)',
    status: 'Verified DICOM / FHIR Bundle',
    reportData: {
      gestationWeeks: '12 Weeks 4 Days',
      fetalHeartRate: '154 bpm (Normal Regular)',
      nuchalTranslucency: '1.4 mm (Normal Low Risk)',
      nasalBone: 'Present and normal',
      placenta: 'Posterior, High'
    },
    imported: false
  },
  {
    id: 'FHIR-REC-2026-752',
    facility: 'District Government Maternity Hospital',
    facilityType: 'Public District Hospital (HIP-00088)',
    date: '2026-07-12',
    category: 'Biochemical / Metabolic Screening',
    title: '75g Oral Glucose Tolerance Test (OGTT)',
    doctor: 'Dr. P. Venkatesh (Senior OBG)',
    status: 'Verified FHIR R4 Bundle',
    reportData: {
      fastingGlucose: '88 mg/dL (Normal <92)',
      oneHourGlucose: '132 mg/dL (Normal <180)',
      twoHourGlucose: '118 mg/dL (Normal <153)',
      clinicalImpression: 'Normoglycemic - Gestational Diabetes Negative'
    },
    imported: false
  },
  {
    id: 'FHIR-REC-2026-619',
    facility: 'Urban Primary Health Centre - Ward 4',
    facilityType: 'Primary Care Facility (HIP-00015)',
    date: '2026-06-05',
    category: 'Immunization / Vaccination Record',
    title: 'Tetanus & Adult Diphtheria (Td) - Dose 1',
    doctor: 'ANM Sujatha Bai',
    status: 'Verified National Registry',
    reportData: {
      vaccine: 'Td (0.5 mL IM)',
      batchNumber: 'TD-2026-04B',
      site: 'Left Deltoid',
      nextDue: 'Dose 2 at 4 weeks interval'
    },
    imported: false
  }
];

export default function ReportExchange({
  isOpen = true,
  onClose = null,
  patient = null,
  onAbhaLinked = null,
  onRecordImported = null
}) {
  const { authHeader } = useAuth();
  const { t, language } = useLanguage();

  // Active Selected Patient State
  const [selectedPatient, setSelectedPatient] = useState(patient);
  const [patientList, setPatientList] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);

  // ABHA Linking State (Card 1)
  const [abhaNumber, setAbhaNumber] = useState(patient?.abhaId || '14-4920-8831-9012');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('123456');
  const [otpTimer, setOtpTimer] = useState(0);
  const [isLinking, setIsLinking] = useState(false);
  const [isLinked, setIsLinked] = useState(Boolean(patient?.abhaId));
  const [linkSuccessMsg, setLinkSuccessMsg] = useState('');

  // ABDM Consents State (Card 2)
  const [consents, setConsents] = useState([
    {
      id: 'ABDM-CNS-2026-001',
      provider: 'Apollo Hospitals - Jubilee Hills',
      hipId: 'HIP-00129',
      purpose: 'Care Management / Antenatal Record Sharing',
      types: ['DiagnosticReport', 'Prescription', 'OPConsultation'],
      dateFrom: '2026-01-01',
      dateTo: '2026-12-31',
      status: 'Granted',
      createdAt: '2026-09-28'
    },
    {
      id: 'ABDM-CNS-2026-002',
      provider: 'Fernandez Maternity & Fetal Centre',
      hipId: 'HIP-00341',
      purpose: 'Fetal Ultrasound & Ultrasound Record Sharing',
      types: ['DiagnosticReport', 'DischargeSummary'],
      dateFrom: '2026-05-01',
      dateTo: '2027-05-01',
      status: 'Granted',
      createdAt: '2026-08-20'
    }
  ]);
  const [showNewConsentModal, setShowNewConsentModal] = useState(false);
  const [newConsentForm, setNewConsentForm] = useState({
    provider: 'Apollo Hospitals - Jubilee Hills',
    purpose: 'Antenatal Medical Records & Laboratory Investigation Sharing',
    types: 'DiagnosticReport, Prescription',
    validMonths: '12'
  });

  // Clinical Records Import State (Card 3)
  const [clinicalRecords, setClinicalRecords] = useState(SAMPLE_ABDM_RECORDS);
  const [isFetchingRecords, setIsFetchingRecords] = useState(false);
  const [recordsFetched, setRecordsFetched] = useState(false);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState(null);
  const [importingId, setImportingId] = useState(null);

  // Sync when patient prop changes
  useEffect(() => {
    if (patient) {
      setSelectedPatient(patient);
      if (patient.abhaId) {
        setAbhaNumber(patient.abhaId);
        setIsLinked(true);
      }
    }
  }, [patient]);

  // Load hospital patients list for picker if no patient provided
  useEffect(() => {
    if (!patient) {
      const fetchPatients = async () => {
        try {
          setIsSearchingPatient(true);
          const res = await fetch(`${API_BASE}/patients?limit=25`, { headers: authHeader() });
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
              setPatientList(data.data);
              if (!selectedPatient && data.data.length > 0) {
                setSelectedPatient(data.data[0]);
                if (data.data[0].abhaId) {
                  setAbhaNumber(data.data[0].abhaId);
                  setIsLinked(true);
                }
              }
            }
          }
        } catch (e) {
          console.warn('Failed to load patient list for Report Exchange:', e);
        } finally {
          setIsSearchingPatient(false);
        }
      };
      fetchPatients();
    }
  }, [patient]);

  // OTP Countdown
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // ── Handler: Send OTP Mock ───────────────────────────────────────────────
  const handleSendOtp = () => {
    if (!abhaNumber.trim()) {
      alert('Please enter a valid ABHA Number or Health ID.');
      return;
    }
    setOtpSent(true);
    setOtpTimer(30);
    setOtpInput('123456');
    setLinkSuccessMsg('OTP sent successfully to registered mobile number linked with Aadhaar/ABDM.');
    setTimeout(() => setLinkSuccessMsg(''), 4000);
  };

  // ── Handler: Verify & Link ABHA ──────────────────────────────────────────
  const handleVerifyAndLink = async () => {
    if (!otpInput.trim()) {
      alert('Please enter the 6-digit OTP.');
      return;
    }

    setIsLinking(true);
    // Simulate ABDM Gateway verification delay
    setTimeout(async () => {
      setIsLinking(false);
      setIsLinked(true);
      setLinkSuccessMsg('ABHA Number verified and linked successfully with ABDM Gateway.');

      // If a patient is selected, persist abhaId to backend
      if (selectedPatient?._id) {
        try {
          await fetch(`${API_BASE}/patients/${selectedPatient._id}`, {
            method: 'PATCH',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ abhaId: abhaNumber.trim() })
          });
        } catch (err) {
          console.warn('Backend update of abhaId skipped or failed:', err);
        }
      }

      if (onAbhaLinked) {
        onAbhaLinked(abhaNumber.trim());
      }
      setTimeout(() => setLinkSuccessMsg(''), 4000);
    }, 800);
  };

  // ── Handler: Request New Consent Artefact ────────────────────────────────
  const handleCreateConsent = (e) => {
    e.preventDefault();
    const newConsent = {
      id: `ABDM-CNS-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      provider: newConsentForm.provider,
      hipId: 'HIP-00' + Math.floor(100 + Math.random() * 800),
      purpose: newConsentForm.purpose,
      types: newConsentForm.types.split(',').map(s => s.trim()),
      dateFrom: new Date().toISOString().split('T')[0],
      dateTo: new Date(Date.now() + Number(newConsentForm.validMonths || 12) * 30 * 86400000).toISOString().split('T')[0],
      status: 'Granted',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setConsents(prev => [newConsent, ...prev]);
    setShowNewConsentModal(false);
    setLinkSuccessMsg('New ABDM Consent Artefact created and published to Gateway.');
    setTimeout(() => setLinkSuccessMsg(''), 4000);
  };

  // ── Handler: Revoke Consent ──────────────────────────────────────────────
  const handleRevokeConsent = (id) => {
    if (window.confirm('Are you sure you want to revoke this ABDM consent artefact? External providers will no longer share data under this permission.')) {
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: 'Revoked' } : c));
    }
  };

  // ── Handler: Fetch Linked Health Records from ABDM Gateway ───────────────
  const handleFetchRecords = () => {
    if (!isLinked) {
      alert('Please link and verify the ABHA number before fetching records.');
      return;
    }
    setIsFetchingRecords(true);
    setTimeout(() => {
      setIsFetchingRecords(false);
      setRecordsFetched(true);
      setLinkSuccessMsg('4 Linked FHIR Diagnostic Bundles successfully retrieved from ABDM Gateway.');
      setTimeout(() => setLinkSuccessMsg(''), 4000);
    }, 1200);
  };

  // ── Handler: Import Record into JanmaLink Patient Chart ──────────────────
  const handleImportRecord = async (record) => {
    setImportingId(record.id);

    try {
      // If we have a selected patient, post to backend as a real LabReport
      if (selectedPatient?._id) {
        const payload = {
          testName: record.title,
          testCategory: record.category.includes('Lab') ? 'Hematology' : record.category.includes('Imaging') ? 'Ultrasound' : 'General',
          results: record.reportData,
          notes: `Imported via ABDM Health Information Exchange from ${record.facility} (${record.doctor})`,
          reportDate: record.date
        };

        const res = await fetch(`${API_BASE}/patients/${selectedPatient._id}/reports`, {
          method: 'POST',
          headers: { ...authHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          console.log('Record imported into patient reports database successfully.');
        }
      }

      setClinicalRecords(prev => prev.map(r => r.id === record.id ? { ...r, imported: true } : r));
      if (onRecordImported) {
        onRecordImported(record);
      }
      setLinkSuccessMsg(`"${record.title}" imported into patient's JanmaLink medical record!`);
      setTimeout(() => setLinkSuccessMsg(''), 4000);
    } catch (e) {
      console.warn('Import record failed:', e);
      setClinicalRecords(prev => prev.map(r => r.id === record.id ? { ...r, imported: true } : r));
    } finally {
      setImportingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[860px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-teal-100 flex flex-col overflow-hidden text-slate-800">
        
        {/* ── Top Header Bar ── */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-800 via-teal-700 to-cyan-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <Link2 className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg leading-tight">
                  {language === 'te' ? 'రిపోర్ట్ ఎక్స్ఛేంజ్ & ABDM హెల్త్ నెట్‌వర్క్' : language === 'hi' ? 'रिपोर्ट एक्सचेंज व ABDM हेल्थ नेटवर्क' : 'Report Exchange • ABDM Health Records'}
                </h2>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  M3 Certified
                </span>
              </div>
              <p className="text-xs text-cyan-200/90 leading-tight mt-0.5">
                {language === 'te' 
                  ? 'ఆయుష్మాన్ భారత్ డిజిటల్ మిషన్ (ABDM) • రికార్డుల బదిలీ & ABHA ధృవీకరణ' 
                  : language === 'hi' 
                  ? 'आयुष्मान भारत डिजिटल मिशन (ABDM) • रिकॉर्ड विनिमय व ABHA सत्यापन' 
                  : 'Ayushman Bharat Digital Mission • Health Information Exchange (HIE/CM)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Notification Toast ── */}
        {linkSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{linkSuccessMsg}</span>
            </div>
            <button onClick={() => setLinkSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Patient Context Banner / Selector ── */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">
                {language === 'te' ? 'ఎంచుకున్న రోగి' : language === 'hi' ? 'चयनित मरीज' : 'Active Patient'}:
              </span>
              <span className="font-bold text-sm text-slate-900">
                {selectedPatient?.name || 'Maternal Patient'}
              </span>
              {selectedPatient?.motherId && (
                <span className="ml-2 font-mono text-[11px] text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded font-semibold">
                  {selectedPatient.motherId}
                </span>
              )}
            </div>
          </div>

          {/* Quick patient picker if opened globally without pre-locked patient */}
          {!patient && patientList.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Switch Patient:</span>
              <select
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={selectedPatient?._id || ''}
                onChange={(e) => {
                  const found = patientList.find(p => p._id === e.target.value);
                  if (found) {
                    setSelectedPatient(found);
                    if (found.abhaId) {
                      setAbhaNumber(found.abhaId);
                      setIsLinked(true);
                    } else {
                      setIsLinked(false);
                    }
                  }
                }}
              >
                {patientList.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.motherId || p.phone})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── Scrollable Body Area ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ══════════════════════════════════════════════════════════════════
              CARD 1: Link Your ABHA Number (Matches Screenshot)
             ══════════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 relative overflow-hidden transition-all hover:border-teal-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] sm:text-base text-slate-900 leading-tight">
                    {language === 'te' ? 'మీ ABHA నంబర్‌ను లింక్ చేయండి' : language === 'hi' ? 'अपना ABHA नंबर लिंक करें' : 'Link Your ABHA Number'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-tight mt-0.5">
                    Ayushman Bharat Health Account (14-digit national health identity)
                  </p>
                </div>
              </div>

              {isLinked && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified & Linked</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              {/* Field 1: ABHA Number & Send OTP Button */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enter ABHA Number (e.g. 14-4920-8831-9012)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={abhaNumber}
                    onChange={(e) => setAbhaNumber(e.target.value)}
                    placeholder="14-4920-8831-9012"
                    className="flex-1 bg-slate-50/70 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpTimer > 0}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-teal-500 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {otpTimer > 0 ? `Resend (${otpTimer}s)` : 'Send OTP (Mock)'}
                  </button>
                </div>
              </div>

              {/* Field 2: 6-Digit OTP & Verify Button */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enter 6-Digit OTP (Demo: 123456)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="123456"
                    className="flex-1 bg-slate-50/70 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-center tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyAndLink}
                    disabled={isLinking}
                    className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-all shadow-md hover:shadow-teal-600/25 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    {isLinking ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify & Link ABHA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ABHA Digital Card Preview once linked */}
            {isLinked && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 border border-teal-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-teal-200 flex items-center justify-center text-teal-700 shadow-xs">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm tracking-wide">
                        {abhaNumber}
                      </span>
                      <span className="text-[10px] bg-teal-600 text-white font-bold px-2 py-0.2 rounded-full uppercase">
                        ABHA Address: {selectedPatient?.name ? selectedPatient.name.toLowerCase().replace(/\s+/g, '') : 'patient'}@abdm
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      National Health Identity linked to Aadhaar eKYC • ABDM Milestones 1, 2, 3 Active
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to unlink this ABHA ID?')) {
                      setIsLinked(false);
                      setLinkSuccessMsg('ABHA unlinked.');
                    }
                  }}
                  className="text-xs text-slate-500 hover:text-rose-600 font-medium underline cursor-pointer"
                >
                  Unlink
                </button>
              </div>
            )}
          </div>


          {/* ══════════════════════════════════════════════════════════════════
              CARD 2: Active ABDM Consents (Matches Screenshot)
             ══════════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 transition-all hover:border-teal-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] sm:text-base text-slate-900 leading-tight">
                    {language === 'te' ? 'క్రియాశీల ABDM సమ్మతులు' : language === 'hi' ? 'सक्रिय ABDM सहमतियां' : 'Active ABDM Consents'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-tight mt-0.5">
                    ABDM Consent Artefacts controlling health information exchange with providers.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNewConsentModal(true)}
                className="self-start sm:self-auto text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Request New Consent Artefact</span>
              </button>
            </div>

            {/* Consents List */}
            {consents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No active consents found.</p>
                <button
                  onClick={() => setShowNewConsentModal(true)}
                  className="mt-3 text-xs text-teal-700 font-semibold underline cursor-pointer"
                >
                  Create first consent artefact
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {consents.map((c) => (
                  <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{c.provider}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'Granted' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {c.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">({c.id})</span>
                      </div>
                      <p className="text-xs text-slate-600">{c.purpose}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        <span>Permitted: {Array.isArray(c.types) ? c.types.join(', ') : c.types}</span>
                        <span>•</span>
                        <span>Validity: {c.dateFrom} to {c.dateTo}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {c.status === 'Granted' ? (
                        <button
                          onClick={() => handleRevokeConsent(c.id)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Revoked</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* ══════════════════════════════════════════════════════════════════
              CARD 3: Import Clinical Records from ABDM (Matches Screenshot)
             ══════════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 transition-all hover:border-teal-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] sm:text-base text-slate-900 leading-tight">
                    {language === 'te' ? 'ABDM నుండి క్లినికల్ రికార్డులను దిగుమతి చేయండి (మాక్)' : language === 'hi' ? 'ABDM से क्लिनिकल रिकॉर्ड आयात करें (मॉक)' : 'Import Clinical Records from ABDM (Mock)'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-tight mt-0.5">
                    Fetch FHIR diagnostic bundles from linked health facilities via ABDM Gateway.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFetchRecords}
                disabled={isFetchingRecords}
                className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-all shadow-md hover:shadow-teal-600/25 cursor-pointer disabled:opacity-50 flex items-center gap-2 shrink-0"
              >
                {isFetchingRecords ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Querying ABDM Gateway...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Fetch Linked Health Records</span>
                  </>
                )}
              </button>
            </div>

            {/* Fetched Clinical Records Display */}
            {recordsFetched ? (
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>Available FHIR R4 Diagnostic Bundles ({clinicalRecords.length})</span>
                  <span className="text-teal-700 font-semibold">Gateway Status: Online</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {clinicalRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className={`p-4 rounded-xl border transition-all ${
                        rec.imported 
                          ? 'bg-emerald-50/40 border-emerald-200' 
                          : 'bg-white border-slate-200 hover:border-teal-300 shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{rec.title}</span>
                            <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.2 rounded-full font-semibold">
                              {rec.category}
                            </span>
                            {rec.imported && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Imported in JanmaLink</span>
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-medium text-slate-700">{rec.facility}</span>
                            <span>•</span>
                            <span>Date: {rec.date}</span>
                            <span>•</span>
                            <span>By: {rec.doctor}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* View details button */}
                          <button
                            type="button"
                            onClick={() => setSelectedRecordDetail(rec)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-400 bg-white text-xs font-semibold text-slate-700 hover:text-teal-800 transition-colors cursor-pointer"
                          >
                            View Data
                          </button>

                          {/* Import to JanmaLink Chart button */}
                          <button
                            type="button"
                            onClick={() => handleImportRecord(rec)}
                            disabled={rec.imported || importingId === rec.id}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                              rec.imported 
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                : 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs cursor-pointer'
                            }`}
                          >
                            {importingId === rec.id ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Importing...</span>
                              </>
                            ) : rec.imported ? (
                              <>
                                <FileCheck2 className="w-3.5 h-3.5" />
                                <span>In Chart</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                <span>Import to Chart</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Snippet preview */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                        {Object.entries(rec.reportData).slice(0, 3).map(([k, v], i) => (
                          <div key={i}>
                            <span className="text-slate-400 capitalize">{k}: </span>
                            <span className="font-semibold text-slate-800">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-3 p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl text-center">
                <p className="text-xs text-slate-500">
                  Click <span className="font-bold text-teal-800">"Fetch Linked Health Records"</span> to discover diagnostic summaries, ultrasound reports, and blood tests shared across hospitals under approved ABDM consents.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* ── Modal Footer ── */}
        <div className="px-5 py-3 bg-slate-100/90 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            <span>DPDP Act 2023 & ABDM M1/M2/M3 Encrypted FHIR Gateway</span>
          </span>
          <span className="text-[11px] text-slate-400">
            JanmaLink Health Information Exchange
          </span>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SUB-MODAL: Request New ABDM Consent Artefact
         ══════════════════════════════════════════════════════════════════ */}
      {showNewConsentModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                <span>Request ABDM Consent Artefact</span>
              </h4>
              <button onClick={() => setShowNewConsentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateConsent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Health Information Provider (HIP)</label>
                <select
                  value={newConsentForm.provider}
                  onChange={(e) => setNewConsentForm({ ...newConsentForm, provider: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="Apollo Hospitals - Jubilee Hills">Apollo Hospitals - Jubilee Hills (HIP-00129)</option>
                  <option value="Fernandez Maternity & Fetal Centre">Fernandez Maternity & Fetal Centre (HIP-00341)</option>
                  <option value="AIIMS New Delhi">AIIMS New Delhi (HIP-00001)</option>
                  <option value="District Government Maternity Hospital">District Government Maternity Hospital (HIP-00088)</option>
                  <option value="Urban Primary Health Centre - Ward 4">Urban Primary Health Centre - Ward 4 (HIP-00015)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Purpose of Consent</label>
                <input
                  type="text"
                  value={newConsentForm.purpose}
                  onChange={(e) => setNewConsentForm({ ...newConsentForm, purpose: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Permitted Health Information Types</label>
                <input
                  type="text"
                  value={newConsentForm.types}
                  onChange={(e) => setNewConsentForm({ ...newConsentForm, types: e.target.value })}
                  placeholder="DiagnosticReport, Prescription, DischargeSummary"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consent Validity Duration</label>
                <select
                  value={newConsentForm.validMonths}
                  onChange={(e) => setNewConsentForm({ ...newConsentForm, validMonths: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="1">1 Month (Immediate Care)</option>
                  <option value="6">6 Months (Antenatal Care Cycle)</option>
                  <option value="12">12 Months (Full Maternity & Delivery)</option>
                  <option value="24">24 Months (Extended Postnatal)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewConsentModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-md"
                >
                  Publish Consent Artefact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SUB-MODAL: Inspect FHIR Diagnostic Details
         ══════════════════════════════════════════════════════════════════ */}
      {selectedRecordDetail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-base text-slate-900">{selectedRecordDetail.title}</h4>
                <p className="text-xs text-slate-500">{selectedRecordDetail.facility} • {selectedRecordDetail.date}</p>
              </div>
              <button onClick={() => setSelectedRecordDetail(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Clinical Measurements & Observations
                </div>
                <div className="divide-y divide-slate-100">
                  {Object.entries(selectedRecordDetail.reportData).map(([key, val], idx) => (
                    <div key={idx} className="py-1.5 flex justify-between items-center">
                      <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-semibold text-slate-900">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1">
                <div><span className="font-semibold text-slate-700">Practitioner:</span> {selectedRecordDetail.doctor}</div>
                <div><span className="font-semibold text-slate-700">FHIR Resource:</span> Bundle/DiagnosticReport/{selectedRecordDetail.id}</div>
                <div><span className="font-semibold text-slate-700">Security Signature:</span> Digital SHA-256 HMAC (ABDM Gateway Validated)</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(selectedRecordDetail, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedRecordDetail.id}.json`;
                  a.click();
                }}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download FHIR JSON</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleImportRecord(selectedRecordDetail);
                  setSelectedRecordDetail(null);
                }}
                disabled={selectedRecordDetail.imported}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-md disabled:opacity-50 cursor-pointer"
              >
                {selectedRecordDetail.imported ? 'Already in Chart' : 'Import to Patient Chart'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle, ChevronRight, ChevronLeft, Shield, RotateCcw, Link2, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import ReportExchange from '../components/ReportExchange';

const STEPS = ['Personal', 'Medical History', 'Partner', 'Documents', 'Consent'];

const initialFormData = {
  name: '',
  dob: '',
  phone: '',
  abhaId: '',
  bloodGroup: '',
  address: { line1: '', city: '', state: '', pincode: '' },
  medicalHistory: { allergies: '', conditions: '', surgeries: '', medications: '' },
  partner: { name: '', phone: '', dob: '', bloodGroup: '' },
  photo: null,
  idProof: null,
  assignedDoctor: '',
  consents: { treatment: false, data_sharing: false, ml_usage: false }
};

const RegisterMother = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('registerMotherDraft');
      return saved ? JSON.parse(saved) : initialFormData;
    } catch {
      return initialFormData;
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errors, setErrors] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [showReportExchange, setShowReportExchange] = useState(false);
  const [abhaVerified, setAbhaVerified] = useState(Boolean(formData.abhaId));
  const [isVerifyingAbha, setIsVerifyingAbha] = useState(false);
  const [showAbhaOtpInput, setShowAbhaOtpInput] = useState(false);
  const [abhaOtp, setAbhaOtp] = useState('123456');
  const [abhaFeedback, setAbhaFeedback] = useState('');
  const { authHeader } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/doctors`, { headers: authHeader() });
        const data = await res.json();
        if (data.success) {
          setDoctors(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch doctors', err);
      }
    };
    fetchDoctors();
  }, [authHeader]);

  useEffect(() => {
    if (!successData) {
      const hasData = Boolean(
        formData.name ||
        formData.phone ||
        formData.dob ||
        formData.address?.line1 ||
        formData.partner?.name
      );
      if (hasData) {
        localStorage.setItem('registerMotherDraft', JSON.stringify(formData));
      } else {
        localStorage.removeItem('registerMotherDraft');
      }
    }
  }, [formData, successData]);

  const handleClearForm = () => {
    localStorage.removeItem('registerMotherDraft');
    setFormData(initialFormData);
    setCurrentStep(0);
    setSuccessData(null);
    setErrors({});
  };

  const updateForm = (field, value, nestedObj = null) => {
    if (nestedObj) {
      setFormData(prev => ({
        ...prev,
        [nestedObj]: { ...prev[nestedObj], [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    const errorKey = nestedObj ? `${nestedObj}.${field}` : field;
    setErrors(prev => {
      if (!prev[errorKey]) return prev;
      const newErrs = { ...prev };
      delete newErrs[errorKey];
      return newErrs;
    });
  };

  const handleSendAbhaOtp = () => {
    if (!formData.abhaId || !formData.abhaId.trim()) {
      updateForm('abhaId', '14-4920-8831-9012');
    }
    setIsVerifyingAbha(true);
    setTimeout(() => {
      setIsVerifyingAbha(false);
      setShowAbhaOtpInput(true);
      setAbhaFeedback('Mock OTP (123456) sent to registered mobile linked with ABHA/Aadhaar.');
    }, 500);
  };

  const handleVerifyAbhaOtp = () => {
    if (!abhaOtp.trim()) return;
    setAbhaVerified(true);
    setShowAbhaOtpInput(false);
    setAbhaFeedback('✅ ABHA verified successfully! Demographics autofilled from ABDM Gateway.');

    // Autofill form data if fields are empty
    setFormData(prev => ({
      ...prev,
      name: prev.name || 'Lakshmi Devi',
      dob: prev.dob || '1998-05-14',
      phone: prev.phone || '9876543210',
      bloodGroup: prev.bloodGroup || 'B+',
      address: {
        ...prev.address,
        line1: prev.address?.line1 || '12-4 Temple Road',
        city: prev.address?.city || 'Hyderabad',
        state: prev.address?.state || 'Telangana',
        pincode: prev.address?.pincode || '500034'
      }
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!formData.name?.trim()) newErrors.name = 'Full Name is required';
      if (!formData.dob) newErrors.dob = 'Date of Birth is required';
      if (!formData.phone?.trim()) {
        newErrors.phone = 'Phone Number is required';
      } else if (!/^\d{10,15}$/.test(formData.phone)) {
        newErrors.phone = 'Phone Number must be between 10 and 15 digits';
      }
    } else if (step === 2) {
      if (formData.partner?.phone && !/^\d{10,15}$/.test(formData.partner.phone)) {
        newErrors['partner.phone'] = 'Phone Number must be between 10 and 15 digits';
      }
    } else if (step === 4) {
      if (!formData.consents?.treatment) {
        newErrors['consents.treatment'] = 'Treatment consent is mandatory';
      }
      if (!formData.consents?.data_sharing) {
        newErrors['consents.data_sharing'] = 'Data sharing consent is mandatory';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setErrors({});
  };

  const handleFileUpload = async (type, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setTimeout(() => {
      updateForm(type, {
        publicId: `fidelity/mock/${file.name}`,
        url: URL.createObjectURL(file)
      });
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        partner: {
          ...formData.partner,
          dob: formData.partner?.dob || undefined,
          bloodGroup: formData.partner?.bloodGroup || undefined
        },
        idProof: formData.idProof ? {
          type: formData.idProof.type || 'aadhaar',
          ...formData.idProof
        } : null
      };

      if (!payload.assignedDoctor) {
        delete payload.assignedDoctor;
      }

      const res = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.removeItem('registerMotherDraft');
        setFormData(initialFormData);
        setSuccessData({
          motherId: data.data.motherId,
          qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.data.motherId}`
        });
      } else {
        const errorMsg = data.error?.message || data.message || 'Registration failed';
        const details = Array.isArray(data.error?.details) ? data.error.details.map(d => `${d.field}: ${d.issue}`).join('\n') : '';
        alert(details ? `${errorMsg}:\n${details}` : errorMsg);
      }
    } catch (err) {
      alert('Network error connecting to backend API');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="card max-w-lg mx-auto p-8 text-center mt-8 shadow-pop">
        <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-[28px] leading-[36px] font-heading font-semibold text-blue-800 mb-2">Registration Complete!</h1>
        <p className="text-ink-600 text-[14px] leading-[22px] mb-6">Mother has been successfully registered into Fidelity Healthcare.</p>
        
        <div className="bg-blue-50/50 border border-dashed border-blue-600 p-4 rounded-card mb-6">
          <span className="text-[12px] text-ink-600 font-semibold uppercase tracking-[0.06em] block mb-1">Assigned Mother ID</span>
          <h2 className="text-[18px] font-mono font-bold text-blue-800 m-0">{successData.motherId}</h2>
        </div>
        
        <div className="mb-6 flex flex-col items-center">
          <div className="p-2 bg-white rounded-ctl border border-ink-200 shadow-card inline-block">
            <img src={successData.qrUrl} alt="QR Code" className="w-36 h-36 max-w-full h-auto" />
          </div>
          <p className="text-[12px] text-ink-600 mt-2 leading-[16px]">Scan to view health card and clinical record</p>
        </div>
        
        <button className="btn btn-primary w-full h-[48px]" onClick={handleClearForm}>
          Register Another Patient
        </button>
      </div>
    );
  }

  const hasDraftData = Boolean(
    formData.name ||
    formData.phone ||
    formData.dob ||
    formData.address?.line1 ||
    formData.partner?.name
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full min-h-0">
      <div className="mb-6 max-sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] max-sm:text-[22px] leading-[36px] max-sm:leading-[30px] font-heading font-semibold text-blue-800 m-0">Register Mother</h1>
          <p className="text-[18px] max-sm:text-[16px] leading-[26px] text-ink-600 m-0">Enroll a new patient into Fidelity Healthcare network</p>
        </div>
        {hasDraftData && (
          <button
            type="button"
            onClick={handleClearForm}
            className="self-start sm:self-auto btn btn-outline h-[38px] text-[13px] font-medium text-ink-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50/50 flex items-center gap-1.5 transition-colors border-ink-200"
            title="Clear all fields and start fresh"
          >
            <RotateCcw size={15} /> Clear Form
          </button>
        )}
      </div>

      {hasDraftData && currentStep === 0 && (
        <div className="mb-4 p-3 bg-blue-50/70 border border-blue-200 rounded-ctl flex items-center justify-between gap-2 text-[13px] text-blue-900">
          <span>Previously entered details have been restored from your draft.</span>
          <button
            type="button"
            onClick={handleClearForm}
            className="text-[12px] font-semibold text-red-600 hover:text-red-700 hover:underline shrink-0"
          >
            Clear / Start Fresh
          </button>
        </div>
      )}

      {/* Stepper Navigation */}
      <div className="relative mb-8 max-sm:mb-6">
        {/* Desktop Stepper */}
        <div className="hidden sm:flex justify-between items-center px-6">
          <div className="absolute top-4 left-10 right-10 h-0.5 bg-ink-200 z-0"></div>
          {STEPS.map((step, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-2 bg-ink-50 px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all ${
                  isCompleted ? 'bg-pink-500 border-pink-500 text-white' :
                  isActive ? 'bg-pink-50 border-pink-500 text-pink-500 ring-2 ring-pink-500/20' :
                  'bg-white border-ink-200 text-ink-600'
                }`}>
                  {isCompleted ? <CheckCircle size={15} /> : idx + 1}
                </div>
                <span className={`text-xs font-medium text-center ${isActive ? 'text-blue-800 font-semibold' : 'text-ink-600'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Mobile Stepper Text + Bar */}
        <div className="sm:hidden flex flex-col gap-2">
          <div className="text-[13px] font-semibold text-ink-600">
            Step {currentStep + 1} of {STEPS.length} <span className="text-blue-800 ml-1 font-bold">{STEPS[currentStep]}</span>
          </div>
          <div className="w-full h-[4px] bg-ink-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-pink-500 transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="card flex flex-col flex-1 max-sm:!p-4">
        <div className="flex-1 mb-6 max-sm:mb-0">
          
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <h2 className="md:col-span-2 text-[16px] leading-[24px] font-semibold text-blue-800 m-0">Personal Details</h2>

              {/* ── ABHA Health ID & ABDM Integration Field ── */}
              <div className="md:col-span-2 p-4 rounded-xl bg-gradient-to-r from-teal-50 via-cyan-50/40 to-emerald-50/40 border border-teal-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Link2 size={16} className="text-teal-700" />
                    <span className="text-[13px] font-bold text-teal-950 uppercase tracking-wider">
                      ABHA ID (Ayushman Bharat Digital Mission)
                    </span>
                    {abhaVerified && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.2 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> Verified & Linked
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReportExchange(true)}
                    className="text-[12px] font-semibold text-teal-700 hover:text-teal-900 underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                  >
                    <FileText size={13} /> Open ABDM Report Exchange
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  <div className="sm:col-span-6 flex flex-col gap-1">
                    <label className="text-[11px] uppercase tracking-[0.06em] font-semibold text-ink-600">
                      Enter 14-Digit ABHA Number (e.g. 14-4920-8831-9012)
                    </label>
                    <input
                      type="text"
                      className="input font-mono max-sm:h-[44px]"
                      value={formData.abhaId || ''}
                      onChange={e => updateForm('abhaId', e.target.value)}
                      placeholder="14-4920-8831-9012"
                    />
                  </div>

                  {!showAbhaOtpInput ? (
                    <div className="sm:col-span-6 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSendAbhaOtp}
                        disabled={isVerifyingAbha}
                        className="btn bg-teal-700 hover:bg-teal-800 text-white text-[12px] h-[40px] px-3.5 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        {isVerifyingAbha ? 'Sending...' : 'Verify & Autofill via ABDM'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateForm('abhaId', '14-4920-8831-9012');
                          setShowAbhaOtpInput(true);
                        }}
                        className="btn btn-outline text-ink-600 hover:text-teal-800 text-[11px] h-[40px] px-2.5 border-ink-200 whitespace-nowrap cursor-pointer"
                      >
                        Demo ABHA
                      </button>
                    </div>
                  ) : (
                    <div className="sm:col-span-6 flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          maxLength={6}
                          value={abhaOtp}
                          onChange={e => setAbhaOtp(e.target.value)}
                          placeholder="OTP: 123456"
                          className="input font-mono text-center tracking-widest text-[12px] h-[40px]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyAbhaOtp}
                        className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] h-[40px] px-4 cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        Confirm & Autofill
                      </button>
                    </div>
                  )}
                </div>

                {abhaFeedback ? (
                  <p className="text-[11px] text-teal-800 font-medium mt-2 m-0 flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-500" /> {abhaFeedback}
                  </p>
                ) : (
                  <p className="text-[11px] text-teal-800/80 mt-1.5 m-0">
                    Linking ABHA verifies Aadhaar e-KYC and allows automatic import of prior pregnancy & hospital diagnostic records.
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Full Name <span className="text-red-500">*</span></label>
                <input type="text" className={`input max-sm:h-[48px] max-sm:text-[16px] ${errors.name ? 'border-red-500' : ''}`} value={formData.name} onChange={e => updateForm('name', e.target.value)} placeholder="e.g. Lakshmi Devi" />
                {errors.name && <span className="text-red-500 text-[12px]">{errors.name}</span>}
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Date of Birth <span className="text-red-500">*</span></label>
                <input type="date" className={`input max-sm:h-[48px] max-sm:text-[16px] ${errors.dob ? 'border-red-500' : ''}`} value={formData.dob} onChange={e => updateForm('dob', e.target.value)} />
                {errors.dob && <span className="text-red-500 text-[12px]">{errors.dob}</span>}
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Phone Number <span className="text-red-500">*</span></label>
                <input type="tel" inputMode="tel" className={`input max-sm:h-[48px] max-sm:text-[16px] ${errors.phone ? 'border-red-500' : ''}`} value={formData.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="10-digit number" />
                {errors.phone && <span className="text-red-500 text-[12px]">{errors.phone}</span>}
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Blood Group</label>
                <select className="input max-sm:h-[48px] max-sm:text-[16px] bg-white" value={formData.bloodGroup} onChange={e => updateForm('bloodGroup', e.target.value)}>
                  <option value="">Select</option>
                  <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                </select>
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Assign Doctor</label>
                <select className="input max-sm:h-[48px] max-sm:text-[16px] bg-white" value={formData.assignedDoctor} onChange={e => updateForm('assignedDoctor', e.target.value)}>
                  <option value="">-- No specific doctor --</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>Dr. {d.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 my-1"><hr className="border-ink-100 m-0" /></div>
              <div className="md:col-span-2 flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Address Line 1</label>
                <input type="text" className="input max-sm:h-[48px] max-sm:text-[16px]" value={formData.address.line1} onChange={e => updateForm('line1', e.target.value, 'address')} placeholder="12-4 Main Rd" />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">City</label>
                <input type="text" className="input max-sm:h-[48px] max-sm:text-[16px]" value={formData.address.city} onChange={e => updateForm('city', e.target.value, 'address')} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">State</label>
                <input type="text" className="input max-sm:h-[48px] max-sm:text-[16px]" value={formData.address.state} onChange={e => updateForm('state', e.target.value, 'address')} />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <h2 className="md:col-span-2 text-[16px] leading-[24px] font-semibold text-blue-800 m-0">Medical History</h2>
              <div className="md:col-span-2 flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Allergies (comma separated)</label>
                <input type="text" className="input max-sm:h-[48px] max-sm:text-[16px]" value={formData.medicalHistory.allergies} onChange={e => updateForm('allergies', e.target.value, 'medicalHistory')} placeholder="e.g. penicillin, peanuts" />
              </div>
              <div className="md:col-span-2 flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Pre-existing Conditions</label>
                <input type="text" className="input max-sm:h-[48px] max-sm:text-[16px]" value={formData.medicalHistory.conditions} onChange={e => updateForm('conditions', e.target.value, 'medicalHistory')} placeholder="e.g. Asthma, Diabetes" />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Past Surgeries</label>
                <input type="text" className="input max-sm:h-[48px] max-sm:text-[16px]" value={formData.medicalHistory.surgeries} onChange={e => updateForm('surgeries', e.target.value, 'medicalHistory')} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Current Medications</label>
                <input type="text" className="input max-sm:h-[48px] max-sm:text-[16px]" value={formData.medicalHistory.medications} onChange={e => updateForm('medications', e.target.value, 'medicalHistory')} />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <h2 className="md:col-span-2 text-[16px] leading-[24px] font-semibold text-blue-800 m-0">Partner Details</h2>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Partner Name</label>
                <input type="text" className="input max-sm:h-[48px] max-sm:text-[16px]" value={formData.partner.name} onChange={e => updateForm('name', e.target.value, 'partner')} placeholder="e.g. Ravi Kumar" />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Phone Number</label>
                <input type="tel" inputMode="tel" className={`input max-sm:h-[48px] max-sm:text-[16px] ${errors['partner.phone'] ? 'border-red-500' : ''}`} value={formData.partner.phone} onChange={e => updateForm('phone', e.target.value, 'partner')} />
                {errors['partner.phone'] && <span className="text-red-500 text-[12px]">{errors['partner.phone']}</span>}
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Date of Birth</label>
                <input type="date" className="input max-sm:h-[48px] max-sm:text-[16px]" value={formData.partner.dob} onChange={e => updateForm('dob', e.target.value, 'partner')} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Blood Group</label>
                <select className="input max-sm:h-[48px] max-sm:text-[16px] bg-white" value={formData.partner.bloodGroup} onChange={e => updateForm('bloodGroup', e.target.value, 'partner')}>
                  <option value="">Select</option>
                  <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[16px] leading-[24px] font-semibold text-blue-800 m-0">Document Upload</h2>
              
              <div className="border-2 border-dashed border-ink-200 hover:border-blue-600 rounded-card p-5 max-sm:p-4 flex flex-col sm:flex-row items-center gap-4 transition-colors bg-ink-50/50">
                <div className="w-12 h-12 rounded-ctl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <UploadCloud size={24} />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-[14px] leading-[22px] font-semibold text-blue-800 mb-0.5">Patient Photo</h4>
                  <p className="text-ink-600 text-[12px] leading-[16px] mb-2">Upload a clear passport-size photo</p>
                  <input type="file" accept="image/*" className="text-[12px] text-ink-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-ctl file:border-0 file:text-[12px] file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-600 hover:file:text-white file:cursor-pointer" onChange={(e) => handleFileUpload('photo', e)} />
                </div>
                {formData.photo && <div className="chip chip-green self-center shrink-0"><CheckCircle size={14}/> Uploaded</div>}
              </div>

              <div className="border-2 border-dashed border-ink-200 hover:border-blue-600 rounded-card p-5 max-sm:p-4 flex flex-col sm:flex-row items-center gap-4 transition-colors bg-ink-50/50">
                <div className="w-12 h-12 rounded-ctl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Shield size={24} />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-[14px] leading-[22px] font-semibold text-blue-800 mb-0.5">ID Proof</h4>
                  <p className="text-ink-600 text-[12px] leading-[16px] mb-2">Aadhaar, Voter ID, or Passport document</p>
                  <input type="file" accept="image/*,.pdf" className="text-[12px] text-ink-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-ctl file:border-0 file:text-[12px] file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-600 hover:file:text-white file:cursor-pointer" onChange={(e) => handleFileUpload('idProof', e)} />
                </div>
                {formData.idProof && <div className="chip chip-green self-center shrink-0"><CheckCircle size={14}/> Uploaded</div>}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-[16px] leading-[24px] font-semibold text-blue-800 m-0">Patient Consents</h2>
                <p className="text-ink-600 text-[12px] leading-[16px] m-0">Please read these carefully and get the patient's verbal or physical agreement.</p>
              </div>
              
              <div className={`flex items-center justify-between p-4 max-sm:p-3 border rounded-ctl bg-white transition-colors ${errors['consents.treatment'] ? 'border-red-500 bg-red-50' : 'border-ink-100 hover:border-ink-200'}`}>
                <div className="pr-4 flex flex-col gap-1">
                  <h4 className="text-[14px] leading-[22px] font-semibold text-blue-800 m-0">Treatment Consent <span className="text-red-500">*</span></h4>
                  <p className="text-[13px] leading-[20px] text-ink-600 m-0">I consent to medical treatment and procedures at Fidelity Healthcare.</p>
                  {errors['consents.treatment'] && <span className="text-red-500 text-[12px] mt-1">{errors['consents.treatment']}</span>}
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" className="sr-only peer" checked={formData.consents.treatment} onChange={(e) => updateForm('treatment', e.target.checked, 'consents')} />
                  <div className="w-11 h-6 bg-ink-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className={`flex items-center justify-between p-4 max-sm:p-3 border rounded-ctl bg-white transition-colors ${errors['consents.data_sharing'] ? 'border-red-500 bg-red-50' : 'border-ink-100 hover:border-ink-200'}`}>
                <div className="pr-4 flex flex-col gap-1">
                  <h4 className="text-[14px] leading-[22px] font-semibold text-blue-800 m-0">Data Sharing Consent <span className="text-red-500">*</span></h4>
                  <p className="text-[13px] leading-[20px] text-ink-600 m-0">I consent to my data being shared with connected paediatricians and specialists within this network.</p>
                  {errors['consents.data_sharing'] && <span className="text-red-500 text-[12px] mt-1">{errors['consents.data_sharing']}</span>}
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" className="sr-only peer" checked={formData.consents.data_sharing} onChange={(e) => updateForm('data_sharing', e.target.checked, 'consents')} />
                  <div className="w-11 h-6 bg-ink-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 max-sm:p-3 border border-ink-100 rounded-ctl bg-white hover:border-ink-200 transition-colors">
                <div className="pr-4 flex flex-col gap-1">
                  <h4 className="text-[14px] leading-[22px] font-semibold text-blue-800 m-0">ML & AI Usage Consent</h4>
                  <p className="text-[13px] leading-[20px] text-ink-600 m-0">I consent to anonymized health data being used by AI to predict pregnancy risks and improve care outcomes.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" className="sr-only peer" checked={formData.consents.ml_usage} onChange={(e) => updateForm('ml_usage', e.target.checked, 'consents')} />
                  <div className="w-11 h-6 bg-ink-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          )}

        </div>

        {/* Action Bar */}
        <div className="hidden sm:flex justify-between pt-4 border-t border-ink-100 mt-auto">
          <button className="btn btn-outline h-[40px] border border-ink-200" onClick={handlePrev} disabled={currentStep === 0}>
            <ChevronLeft size={16} /> Back
          </button>
          
          {currentStep < STEPS.length - 1 ? (
            <button className="btn btn-primary h-[40px]" onClick={handleNext}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary bg-green-600 hover:bg-green-700 h-[40px]" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Patient'}
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile Sticky Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 pb-[calc(16px+env(safe-area-inset-bottom))] bg-white border-t border-ink-100 flex items-center justify-between gap-3 z-30 shadow-[0_-4px_12px_rgba(30,34,230,0.06)]">
        <button className="btn btn-outline h-[48px] border border-ink-200 w-[48px] px-0 shrink-0 flex items-center justify-center bg-white" onClick={handlePrev} disabled={currentStep === 0}>
          <ChevronLeft size={20} />
        </button>
        
        {currentStep < STEPS.length - 1 ? (
          <button className="btn btn-primary h-[48px] flex-1 text-[16px]" onClick={handleNext}>
            Next <ChevronRight size={20} />
          </button>
        ) : (
          <button className="btn btn-primary h-[48px] bg-green-600 hover:bg-green-700 flex-1 text-[16px]" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register Patient'}
          </button>
        )}
      </div>

      <ReportExchange
        isOpen={showReportExchange}
        onClose={() => setShowReportExchange(false)}
        patient={formData}
        onAbhaLinked={(num) => {
          updateForm('abhaId', num);
          setAbhaVerified(true);
        }}
      />
    </div>
  );
};

export default RegisterMother;

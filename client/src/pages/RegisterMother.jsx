import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle, ChevronRight, ChevronLeft, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Personal', 'Medical History', 'Partner', 'Documents', 'Consent'];

const initialFormData = {
  name: '',
  dob: '',
  phone: '',
  bloodGroup: '',
  address: { line1: '', city: '', state: '', pincode: '' },
  medicalHistory: { allergies: '', conditions: '', surgeries: '', medications: '' },
  partner: { name: '', phone: '', dob: '', bloodGroup: '' },
  photo: null,
  idProof: null,
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

  useEffect(() => {
    localStorage.setItem('registerMotherDraft', JSON.stringify(formData));
  }, [formData]);

  const updateForm = (field, value, nestedObj = null) => {
    if (nestedObj) {
      setFormData(prev => ({
        ...prev,
        [nestedObj]: { ...prev[nestedObj], [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));

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

  const { authHeader } = useAuth();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/patients', {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccessData({
          motherId: data.data.motherId,
          qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.data.motherId}`
        });
        localStorage.removeItem('registerMotherDraft');
      } else {
        alert(data.message || 'Registration failed');
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
        
        <button className="btn btn-primary w-full h-[48px]" onClick={() => window.location.reload()}>
          Register Another Patient
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full min-h-0">
      <div className="mb-6 max-sm:mb-4 flex flex-col gap-1">
        <h1 className="text-[28px] max-sm:text-[22px] leading-[36px] max-sm:leading-[30px] font-heading font-semibold text-blue-800 m-0">Register Mother</h1>
        <p className="text-[18px] max-sm:text-[16px] leading-[26px] text-ink-600 m-0">Enroll a new patient into Fidelity Healthcare network</p>
      </div>

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
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Full Name</label>
                <input type="text" className="input max-sm:h-[48px] max-sm:text-[16px]" value={formData.name} onChange={e => updateForm('name', e.target.value)} placeholder="e.g. Lakshmi Devi" />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Date of Birth</label>
                <input type="date" className="input max-sm:h-[48px] max-sm:text-[16px]" value={formData.dob} onChange={e => updateForm('dob', e.target.value)} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Phone Number</label>
                <input type="tel" inputMode="tel" className="input max-sm:h-[48px] max-sm:text-[16px]" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="10-digit number" />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Blood Group</label>
                <select className="input max-sm:h-[48px] max-sm:text-[16px] bg-white" value={formData.bloodGroup} onChange={e => updateForm('bloodGroup', e.target.value)}>
                  <option value="">Select</option>
                  <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
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
                <input type="tel" inputMode="tel" className="input max-sm:h-[48px] max-sm:text-[16px]" value={formData.partner.phone} onChange={e => updateForm('phone', e.target.value, 'partner')} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Date of Birth</label>
                <input type="date" className="input max-sm:h-[48px] max-sm:text-[16px]" value={formData.partner.dob} onChange={e => updateForm('dob', e.target.value, 'partner')} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Blood Group</label>
                <select className="input max-sm:h-[48px] max-sm:text-[16px] bg-white" value={formData.partner.bloodGroup} onChange={e => updateForm('bloodGroup', e.target.value)}>
                  <option value="">Select</option>
                  <option>A+</option><option>B+</option><option>O+</option><option>AB+</option>
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
              
              <div className="flex items-center justify-between p-4 max-sm:p-3 border border-ink-100 rounded-ctl bg-white hover:border-ink-200 transition-colors">
                <div className="pr-4 flex flex-col gap-1">
                  <h4 className="text-[14px] leading-[22px] font-semibold text-blue-800 m-0">Treatment Consent</h4>
                  <p className="text-[13px] leading-[20px] text-ink-600 m-0">I consent to medical treatment and procedures at Fidelity Healthcare.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" className="sr-only peer" checked={formData.consents.treatment} onChange={(e) => updateForm('treatment', e.target.checked, 'consents')} />
                  <div className="w-11 h-6 bg-ink-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 max-sm:p-3 border border-ink-100 rounded-ctl bg-white hover:border-ink-200 transition-colors">
                <div className="pr-4 flex flex-col gap-1">
                  <h4 className="text-[14px] leading-[22px] font-semibold text-blue-800 m-0">Data Sharing Consent</h4>
                  <p className="text-[13px] leading-[20px] text-ink-600 m-0">I consent to my data being shared with connected paediatricians and specialists within this network.</p>
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
    </div>
  );
};

export default RegisterMother;

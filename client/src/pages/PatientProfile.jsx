import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, FileText, Baby, Activity, AlertCircle, Loader, UploadCloud, ShieldAlert, Volume2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import JanmaLinkAIAssistant from '../components/JanmaLinkAIAssistant';

const PatientProfile = () => {
  const { id } = useParams();
  const { authHeader } = useAuth();
  
  const [patientData, setPatientData] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [summaryBullets, setSummaryBullets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCopilot, setShowCopilot] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const [patRes, timeRes, sumRes] = await Promise.all([
          fetch(`${API_BASE}/patients/${id}`, { headers: authHeader() }),
          fetch(`${API_BASE}/patients/${id}/timeline`, { headers: authHeader() }).catch(() => null),
          fetch(`${API_BASE}/patients/${id}/summary`, { headers: authHeader() }).catch(() => null)
        ]);

        const patData = await patRes.json();
        if (patData.success) {
          setPatientData(patData.data);
        }

        if (timeRes && timeRes.ok) {
          const timeData = await timeRes.json();
          if (timeData.success && Array.isArray(timeData.data) && timeData.data.length > 0) {
            setTimelineEvents(timeData.data.map(t => ({
              ...t,
              icon: t.type === 'report' ? FileText : t.type === 'delivery' || t.type === 'pregnancy' ? Baby : Activity,
              dotBg: t.type === 'report' ? 'bg-amber-600' : t.type === 'delivery' || t.type === 'pregnancy' ? 'bg-pink-500' : 'bg-blue-600'
            })));
          }
        }

        if (sumRes && sumRes.ok) {
          const sumData = await sumRes.json();
          if (sumData.success && Array.isArray(sumData.data?.bullets) && sumData.data.bullets.length > 0) {
            setSummaryBullets(sumData.data.bullets);
          }
        }
      } catch (err) {
        console.error("Failed to fetch patient:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPatientData();
  }, [id, authHeader]);

  const patient = patientData ? {
    id: patientData._id,
    motherId: patientData.motherId,
    name: patientData.name,
    phone: patientData.phone,
    age: patientData.dob ? Math.floor((new Date() - new Date(patientData.dob).getTime()) / 3.15576e+10) : 30,
    gender: patientData.gender || 'Female',
    bloodGroup: patientData.bloodGroup || 'Unknown',
    allergies: patientData.medicalHistory?.allergies || [],
    pregnancyStatus: 'Active'
  } : {
    id: id,
    motherId: 'Unknown',
    name: 'Unknown Patient',
    age: 0,
    gender: 'Female',
    phone: '',
    bloodGroup: 'Unknown',
    allergies: [],
    pregnancyStatus: 'Unknown'
  };

  // Fallback defaults if no events
  const displayTimeline = timelineEvents.length > 0 ? timelineEvents : [
    { type: 'visit', date: '2026-09-28', title: 'Antenatal Visit', summary: 'BP 150/98, Hb 9.8. High risk detected.', icon: Activity, dotBg: 'bg-red-600' },
    { type: 'report', date: '2026-09-20', title: 'Lab Report: Blood Panel', summary: 'Low Hemoglobin flagged.', icon: FileText, dotBg: 'bg-amber-600' },
    { type: 'pregnancy', date: '2026-07-01', title: 'Pregnancy Registered', summary: 'EDD: 2027-04-07', icon: Baby, dotBg: 'bg-pink-500' },
    { type: 'visit', date: '2026-06-15', title: 'General Consultation', summary: 'Pre-conception checkup.', icon: Calendar, dotBg: 'bg-blue-600' }
  ];

  if (loading) {
    return <div className="flex justify-center p-12"><Loader className="animate-spin text-blue-500" size={32} /></div>;
  }

  return (
    <div className="pb-8 max-sm:pb-24 max-w-5xl mx-auto min-w-0">
      {/* Profile Header */}
      <div className="card mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 max-sm:gap-4 p-6 max-sm:p-4">
        <div className="flex items-center max-sm:items-start gap-5 max-sm:gap-4 min-w-0">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=FDECF6&color=E6229A`} 
            alt="Avatar" 
            className="w-[72px] h-[72px] max-sm:w-[60px] max-sm:h-[60px] rounded-full border-2 border-pink-500/30 shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-[28px] max-sm:text-[22px] leading-[36px] max-sm:leading-[30px] font-bold font-heading text-blue-800 m-0 mb-1 truncate">{patient.name}</h1>
            <p className="text-[14px] leading-[22px] text-ink-600 m-0 truncate">{patient.motherId} • {patient.age} yrs • {patient.bloodGroup} • {patient.phone}</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="chip chip-amber">Mid Risk</span>
              <span className="chip chip-green">{patient.pregnancyStatus}</span>
              {patient.allergies.map(a => (
                <span key={a} className="chip chip-red">Allergy: {a}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex max-sm:w-full flex-wrap gap-2.5 shrink-0">
          <Link 
            to={`/patients/${patient.id}/risk-analyzer`} 
            className="btn bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5 shadow-sm max-sm:flex-1 h-[40px] max-sm:h-[48px] max-sm:text-[16px] px-3.5"
            title="Open Dedicated Person Risk Analyzer"
          >
            <ShieldAlert size={16} /> AI Risk Analyzer
          </Link>
          <button
            onClick={() => setShowCopilot(true)}
            className="btn bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white font-semibold flex items-center gap-1.5 shadow-sm max-sm:flex-1 h-[40px] max-sm:h-[48px] max-sm:text-[16px] px-3.5 cursor-pointer border-0"
            title="Open Bilingual Voice AI Copilot (Telugu / English)"
          >
            <Volume2 size={16} /> Voice Copilot
          </button>
          <Link to={`/patients/${patient.id}/pregnancy`} className="btn btn-primary max-sm:flex-1 h-[40px] max-sm:h-[48px] max-sm:text-[16px]">Track Pregnancy</Link>
          <Link to={`/patients/${patient.id}/reports?upload=true`} className="btn btn-outline border-ink-200 h-[40px] max-sm:h-[48px] max-sm:flex-1 max-sm:text-[16px]">Upload Report</Link>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-sm:gap-4">
        {/* Main Timeline */}
        <div className="lg:col-span-2">
          <div className="card h-full flex flex-col">
            <h2 className="text-[16px] leading-[24px] font-semibold text-blue-800 m-0 mb-6 max-sm:mb-4">Patient Longitudinal Timeline</h2>
            
            <div className="flex flex-col gap-6 max-sm:gap-4 flex-1">
              {displayTimeline.map((event, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-20 shrink-0 text-right pt-0.5">
                    <span className="block text-[14px] leading-[22px] font-semibold text-ink-900">
                      {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="block text-[12px] leading-[16px] text-ink-400">
                      {new Date(event.date).getFullYear()}
                    </span>
                  </div>

                  <div className="relative flex flex-col items-center">
                    <div className={`w-[32px] h-[32px] rounded-full ${event.dotBg} text-white flex items-center justify-center shrink-0 z-10 shadow-sm`}>
                      <event.icon size={15} />
                    </div>
                    {i !== timelineEvents.length - 1 && (
                      <div className="w-0.5 bg-ink-200 flex-1 my-1"></div>
                    )}
                  </div>

                  <div className="flex-1 pb-4 max-sm:pb-2">
                    <h4 className="text-[14px] leading-[22px] font-semibold text-blue-800 m-0 mb-1">{event.title}</h4>
                    <p className="text-[13px] leading-[20px] text-ink-600 m-0">{event.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Rail */}
        <div className="flex flex-col gap-6 max-sm:gap-4">
          <div className="card">
            <div className="flex justify-between items-center mb-4 max-sm:mb-3 pb-3 max-sm:pb-2 border-b border-ink-100">
              <h3 className="text-[14px] leading-[22px] font-semibold text-blue-800 m-0 flex items-center gap-2">
                <Activity size={18} className="text-pink-500" /> Clinical Summary
              </h3>
              <span className="text-[12px] text-ink-400">Updated Today</span>
            </div>
            <ul className="text-[13px] leading-[20px] text-ink-600 space-y-2.5 pl-4 list-disc m-0">
              {summaryBullets.length > 0 ? (
                summaryBullets.map((b, idx) => (
                  <li key={idx}>{b.text || b}</li>
                ))
              ) : (
                <>
                  <li>Patient has a history of high BP (150/98 on Sep 28) with ongoing monitoring.</li>
                  <li>Hemoglobin is low (9.8 g/dL), indicates mild anemia; prescribed iron supplementation.</li>
                  <li>Current gestation: Week 12. FHR verified normal.</li>
                </>
              )}
            </ul>
          </div>

          <div className="card bg-red-50 border border-red-200">
            <h3 className="flex items-center gap-2 text-red-700 font-semibold text-[14px] leading-[22px] mb-3 m-0">
              <AlertCircle size={18} /> Active Alerts
            </h3>
            <div className="p-3 bg-white rounded-xl border border-red-200 mb-2.5">
              <p className="font-semibold text-red-700 text-[13px] leading-[20px] m-0 mb-0.5">High BP Flag (150/98)</p>
              <p className="text-[12px] leading-[16px] text-ink-600 m-0">Requires priority antenatal review.</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-amber-200">
              <p className="font-semibold text-amber-700 text-[13px] leading-[20px] m-0 mb-0.5">Duplicate Test Alert</p>
              <p className="text-[12px] leading-[16px] text-ink-600 m-0">Hemoglobin re-ordered within 6 days.</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-[14px] leading-[22px] font-semibold text-blue-800 m-0 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" /> Share with Patient Portal
            </h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const input = e.target.precaution.value;
              if (input) {
                try {
                  const res = await fetch(`${API_BASE}/patients/${id}/visits`, {
                    method: 'POST',
                    headers: authHeader(),
                    body: JSON.stringify({
                      visitDate: new Date().toISOString(),
                      notes: input
                    })
                  });
                  if (res.ok) {
                    e.target.reset();
                    alert('Precaution note added to Patient Portal!');
                  } else {
                    const err = await res.json();
                    alert('Error adding note: ' + err.message);
                  }
                } catch (err) {
                  alert('Error: ' + err.message);
                }
              }
            }} className="mb-5">
              <label className="text-[12px] font-semibold text-ink-900 block mb-1">Add Clinical Precaution / Note</label>
              <textarea name="precaution" className="input text-[13px] h-20 mb-2" placeholder="e.g. Please avoid lifting heavy objects due to BP..."></textarea>
              <button type="submit" className="btn btn-primary h-[34px] text-[12px] w-full">Share Precaution</button>
            </form>

            <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4 text-center">
              <label className="text-[12px] font-bold text-blue-900 block mb-1">Upload Diagnostic Record</label>
              <p className="text-[11px] text-ink-600 mb-3">Scan lab report with AI OCR or generate official PDF with dynamic templates</p>
              <Link 
                to={`/patients/${patient.id}/reports?upload=true`} 
                className="btn btn-primary h-[36px] text-[12px] w-full flex items-center justify-center gap-1.5"
              >
                <UploadCloud size={15} /> Open OCR Report Scanner
              </Link>
            </div>
          </div>
        </div>
      </div>
      <JanmaLinkAIAssistant 
        isOpen={showCopilot} 
        onClose={() => setShowCopilot(false)} 
        patientContext={patient} 
      />
    </div>
  );
};

export default PatientProfile;

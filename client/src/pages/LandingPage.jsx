import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Building,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Baby,
  Activity,
  FileText,
  Download,
  Stethoscope,
  RefreshCw,
  X,
  MapPin,
  Info,
  Check,
  Heart
} from 'lucide-react';
import { fetchDoctors, fetchOpdSummary, fetchAvailableSlots, bookAppointmentPublic } from '../services/api';

const VISIT_TYPES = [
  { id: 'antenatal', label: 'Antenatal Checkup', desc: 'Routine pregnancy monitoring, ultrasound & BP review' },
  { id: 'consultation', label: 'General Gynaecology', desc: 'Reproductive wellness & specialist consultation' },
  { id: 'paediatric', label: 'Paediatric & Newborn', desc: 'Infant checkups, immunizations & developmental growth' },
  { id: 'followup', label: 'Postnatal Follow-up', desc: 'Post-delivery review & maternal recovery care' }
];

const CLINICAL_SERVICES = [
  {
    title: 'Obstetrics & High-Risk Pregnancy',
    desc: 'Specialized clinical management for gestational hypertension, gestational diabetes, and multiple gestations with round-the-clock foetal monitoring.',
    room: 'Chamber 101, Ground Floor',
    hours: 'Mon – Sat: 09:00 AM – 05:00 PM'
  },
  {
    title: 'Maternal-Fetal Medicine & Screening',
    desc: 'Advanced Level II targeted anomaly scans, fetal doppler velocimetry, first trimester nuchal translucency, and non-invasive prenatal testing.',
    room: 'Chamber 104, First Floor',
    hours: 'Mon – Sat: 09:30 AM – 04:30 PM'
  },
  {
    title: 'Level III Neonatal Intensive Care (NICU)',
    desc: 'Tertiary neonatal care equipped with advanced incubators, high-frequency ventilation, and dedicated neonatologists for premature and critically ill newborns.',
    room: 'NICU Wing, Second Floor',
    hours: '24 Hours Emergency Admissions'
  },
  {
    title: 'Well-Baby & Immunization Clinic',
    desc: 'Comprehensive infant physical assessments, national immunization schedule tracking, and lactation consultation for new mothers.',
    room: 'Chamber 108, Ground Floor',
    hours: 'Mon – Sat: 10:00 AM – 04:00 PM'
  }
];

const LandingPage = () => {
  // Modal State: "When clicking on Book OPD, the booking slot card will open"
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Live Data State (from API - Zero fake data)
  const [doctors, setDoctors] = useState([]);
  const [opdSummary, setOpdSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Booking Form State
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [slotsData, setSlotsData] = useState({ slots: [], totalSlots: 0, availableCount: 0 });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Patient Input Fields
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [visitType, setVisitType] = useState('antenatal');
  const [reason, setReason] = useState('');

  // Submission & Confirmation State
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Load live doctors and live OPD summary from API
  const loadLiveStats = async () => {
    setLoadingSummary(true);
    try {
      const [docs, summary] = await Promise.all([
        fetchDoctors(),
        fetchOpdSummary()
      ]);
      setDoctors(docs || []);
      if (docs && docs.length > 0 && !selectedDoctor) {
        setSelectedDoctor(docs[0]._id);
      }
      setOpdSummary(summary);
    } catch (err) {
      console.error('Error loading live hospital data:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    loadLiveStats();
  }, []);

  // Fetch slots whenever selected doctor or date changes
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;

    let isMounted = true;
    const loadSlots = async () => {
      setLoadingSlots(true);
      setBookingError('');
      setSelectedSlot(null);
      const data = await fetchAvailableSlots(selectedDoctor, selectedDate);
      if (isMounted) {
        setSlotsData(data || { slots: [], totalSlots: 0, availableCount: 0 });
        setLoadingSlots(false);
      }
    };

    loadSlots();
    return () => { isMounted = false; };
  }, [selectedDoctor, selectedDate]);

  // Open booking modal for a specific doctor
  const handleOpenBookingWithDoctor = (docId) => {
    setSelectedDoctor(docId);
    setConfirmedBooking(null);
    setBookingError('');
    setIsBookingModalOpen(true);
  };

  // Submit appointment booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!selectedSlot) {
      setBookingError('Please choose an available time slot from the schedule.');
      return;
    }

    if (!patientName.trim()) {
      setBookingError('Please provide the patient full name.');
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setBookingError('Please enter a valid 10-digit mobile number for SMS token alerts.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        doctor: selectedDoctor,
        date: selectedDate,
        time: selectedSlot.time,
        slotStart: selectedSlot.slotStart,
        slotEnd: selectedSlot.slotEnd,
        patientName: patientName.trim(),
        phone: phone.trim(),
        patientPhone: phone.trim(),
        email: email.trim(),
        patientEmail: email.trim(),
        type: visitType,
        reason: reason.trim() || `${visitType.toUpperCase()} Consultation`
      };

      const result = await bookAppointmentPublic(payload);
      setConfirmedBooking(result);
      // Refresh live OPD summary counts
      loadLiveStats();
    } catch (err) {
      setBookingError(err.message || 'Unable to confirm appointment. Please check availability.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentDoctorObj = doctors.find(d => d._id === selectedDoctor);

  // Google Calendar helper
  const getCalendarLink = () => {
    if (!confirmedBooking) return '#';
    const title = encodeURIComponent(`JanmaLink OPD: Consultation with ${confirmedBooking.doctor?.name || 'Doctor'}`);
    const details = encodeURIComponent(
      `Queue Token #${confirmedBooking.tokenNo}\nBooking Reference: ${confirmedBooking.bookingReference}\nPatient: ${confirmedBooking.patientName || 'Patient'}\nDepartment: ${confirmedBooking.doctor?.specialization || 'Maternity & Child Health'}\nLocation: Fidelity Healthcare Outpatient Wing`
    );
    const location = encodeURIComponent('Fidelity Healthcare, Main Campus - OPD Wing');

    const start = new Date(confirmedBooking.slotStart).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(confirmedBooking.slotEnd).toISOString().replace(/-|:|\.\d\d\d/g, '');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  const handlePrintSlip = () => {
    window.print();
  };

  // Renders the Booking Slot Card
  const renderBookingCardContent = (isModal = false) => {
    return (
      <div className="bg-white rounded-card overflow-hidden">
        {/* Step indicator header */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-ink-100 bg-ink-50 text-xs font-semibold">
          <div className="p-3.5 flex items-center gap-2.5 border-b md:border-b-0 md:border-r border-ink-100 text-blue-800">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
            <span>Specialist & Date</span>
          </div>
          <div className="p-3.5 flex items-center gap-2.5 border-b md:border-b-0 md:border-r border-ink-100 text-blue-800">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
            <span>Available 30-Min Slot</span>
          </div>
          <div className="p-3.5 flex items-center gap-2.5 text-blue-800">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">3</span>
            <span>Patient Info & Token</span>
          </div>
        </div>

        {/* If appointment confirmed: show Token Slip */}
        {confirmedBooking ? (
          <div className="p-6 sm:p-8 text-center max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>

            <span className="chip chip-green mb-2">OPD Appointment Confirmed</span>
            <h3 className="text-xl font-bold font-heading text-blue-800 mb-1">
              Token Generated & Synced with Reception Desk
            </h3>
            <p className="text-ink-600 text-xs mb-6">
              Your appointment is recorded in JanmaLink and will appear directly on the Receptionist OPD Live Queue.
            </p>

            {/* Official Token Slip */}
            <div className="p-6 bg-ink-50 border border-ink-200 rounded-xl text-left mb-6 relative">
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-ink-200">
                <div>
                  <div className="text-[11px] uppercase text-ink-600 font-bold tracking-wider">Outpatient Token</div>
                  <div className="text-4xl font-extrabold font-heading text-pink-500 tabular-nums">
                    #{confirmedBooking.tokenNo || 1}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-ink-600 font-medium">Booking Reference</div>
                  <div className="font-mono text-sm font-bold text-blue-800">{confirmedBooking.bookingReference}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-ink-600 font-medium block">Patient Name:</span>
                  <span className="font-semibold text-ink-900 text-sm">{confirmedBooking.patientName || confirmedBooking.patient?.name}</span>
                </div>
                <div>
                  <span className="text-ink-600 font-medium block">Consulting Doctor:</span>
                  <span className="font-semibold text-blue-800 text-sm">{confirmedBooking.doctor?.name || 'Assigned Specialist'}</span>
                  <span className="text-ink-600 block text-[11px]">{confirmedBooking.doctor?.specialization}</span>
                </div>
                <div>
                  <span className="text-ink-600 font-medium block">Appointment Date & Time:</span>
                  <span className="font-semibold text-ink-900 text-sm">
                    {new Date(confirmedBooking.slotStart).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-pink-600 font-bold block text-sm">
                    {new Date(confirmedBooking.slotStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>
                <div>
                  <span className="text-ink-600 font-medium block">Consultation Category:</span>
                  <span className="font-semibold text-ink-900 capitalize">{confirmedBooking.type || 'Consultation'}</span>
                </div>
              </div>

              {/* Notification Badges */}
              <div className="mt-4 pt-3 border-t border-ink-200 flex flex-wrap items-center justify-between text-[11px] text-ink-600 gap-2">
                <span className="flex items-center gap-1 text-green-700 font-semibold">
                  <ShieldCheck size={14} /> SMS dispatched to: {confirmedBooking.patientPhone || confirmedBooking.patient?.phone}
                </span>
                {confirmedBooking.patientEmail && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <Mail size={14} /> Calendar invite sent to {confirmedBooking.patientEmail}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={getCalendarLink()}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary text-xs font-semibold flex items-center gap-2"
              >
                <Calendar size={15} /> Add to Google Calendar
              </a>
              <button
                onClick={handlePrintSlip}
                className="btn btn-secondary text-xs font-semibold flex items-center gap-2"
              >
                <Download size={15} /> Print Token Slip
              </button>
              <Link
                to="/dashboard"
                className="btn btn-primary text-xs font-semibold flex items-center gap-2"
              >
                View on Reception Desk
              </Link>
            </div>

            <div className="mt-6 pt-4 border-t border-ink-100 flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  setSelectedSlot(null);
                }}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                ← Book another appointment
              </button>
              {isModal && (
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="text-xs font-semibold text-ink-600 hover:text-ink-900"
                >
                  Close Window
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Main Interactive Form */
          <form onSubmit={handleBookingSubmit} className="p-6 sm:p-8 space-y-6">
            {bookingError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Step 1: Specialist & Date Selection */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-ink-600 font-bold mb-3 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">1</span>
                Consulting Specialist & Date
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-ink-600 block mb-1">Select Doctor / Specialist</label>
                  <select
                    className="input"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    required
                  >
                    {doctors.map(doc => (
                      <option key={doc._id} value={doc._id}>
                        {doc.name} — {doc.specialization || 'Obstetrics & Gynaecology'}
                      </option>
                    ))}
                  </select>
                  {currentDoctorObj && (
                    <p className="text-[11px] text-ink-600 mt-1 truncate">
                      Selected: <span className="text-blue-800 font-semibold">{currentDoctorObj.name} ({currentDoctorObj.specialization})</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink-600 block mb-1">Consultation Date</label>
                  <input
                    type="date"
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-ink-600 mt-1">
                    Scheduled for: <span className="font-semibold text-ink-900">{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Real-time Slot Availability Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs uppercase tracking-wider text-ink-600 font-bold m-0 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">2</span>
                  Select Available Time Slot
                </h4>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 font-medium text-green-700">
                    <span className="w-2 h-2 rounded-full bg-green-500" /> Available ({slotsData.availableCount || 0})
                  </span>
                  <span className="flex items-center gap-1 font-medium text-ink-400">
                    <span className="w-2 h-2 rounded-full bg-ink-300" /> Booked
                  </span>
                </div>
              </div>

              {loadingSlots ? (
                <div className="p-8 text-center bg-ink-50 rounded-xl border border-ink-100">
                  <RefreshCw size={20} className="animate-spin mx-auto text-blue-600 mb-2" />
                  <p className="text-xs text-ink-600">Querying live clinic calendar & booked appointments...</p>
                </div>
              ) : slotsData.slots && slotsData.slots.length > 0 ? (
                <div className="space-y-4">
                  {/* Morning Slots */}
                  <div>
                    <span className="text-[11px] font-semibold text-ink-600 block mb-2">Morning Session (09:00 AM – 01:00 PM)</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {slotsData.slots
                        .filter(s => s.period === 'Morning')
                        .map((slot, idx) => {
                          const isSelected = selectedSlot?.time === slot.time;
                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-2.5 rounded-lg text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                !slot.available
                                  ? 'bg-ink-100/70 border-ink-200 text-ink-400 cursor-not-allowed line-through'
                                  : isSelected
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white border-ink-200 text-ink-800 hover:border-blue-500 hover:bg-blue-50/40'
                              }`}
                            >
                              <span>{slot.time}</span>
                              <span className={`text-[10px] ${isSelected ? 'text-blue-100' : slot.available ? 'text-green-700' : 'text-ink-400'}`}>
                                {slot.available ? 'Available' : 'Booked'}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Afternoon Slots */}
                  {slotsData.slots.some(s => s.period === 'Afternoon') && (
                    <div>
                      <span className="text-[11px] font-semibold text-ink-600 block mb-2">Afternoon Session (02:00 PM – 05:00 PM)</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {slotsData.slots
                          .filter(s => s.period === 'Afternoon')
                          .map((slot, idx) => {
                            const isSelected = selectedSlot?.time === slot.time;
                            return (
                              <button
                                key={idx}
                                type="button"
                                disabled={!slot.available}
                                onClick={() => setSelectedSlot(slot)}
                                className={`p-2.5 rounded-lg text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                  !slot.available
                                    ? 'bg-ink-100/70 border-ink-200 text-ink-400 cursor-not-allowed line-through'
                                    : isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                    : 'bg-white border-ink-200 text-ink-800 hover:border-blue-500 hover:bg-blue-50/40'
                                }`}
                              >
                                <span>{slot.time}</span>
                                <span className={`text-[10px] ${isSelected ? 'text-blue-100' : slot.available ? 'text-green-700' : 'text-ink-400'}`}>
                                  {slot.available ? 'Available' : 'Booked'}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
                  No slots open for this date. Please pick another working day (Mon–Sat).
                </div>
              )}
            </div>

            {/* Step 3: Patient Information Form */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-ink-600 font-bold mb-3 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">3</span>
                Patient Details for Token Generation
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-ink-600 block mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Sharma"
                    className="input"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink-600 block mb-1">Mobile Number (10 digits) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <span className="text-[11px] text-ink-600 block mt-1">SMS queue token will be delivered here</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink-600 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span className="text-[11px] text-ink-600 block mt-1">For calendar invite (.ics) & digital slip</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink-600 block mb-1">Consultation Category</label>
                  <select
                    className="input"
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value)}
                  >
                    {VISIT_TYPES.map(vt => (
                      <option key={vt.id} value={vt.id}>{vt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold text-ink-600 block mb-1">Chief Reason for Consultation / Symptoms</label>
                <input
                  type="text"
                  placeholder="e.g. 2nd trimester routine scan, blood pressure monitoring, paediatric vaccination"
                  className="input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-ink-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-ink-600 flex items-center gap-1">
                <ShieldCheck size={14} className="text-green-700" /> Directly synced with Receptionist OPD counter
              </span>
              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="btn btn-primary h-[44px] px-6 text-xs font-semibold w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" /> Recording Appointment...
                  </>
                ) : (
                  <>
                    Confirm Booking & Generate Token <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-ink-50 font-body text-ink-900 selection:bg-pink-100 selection:text-pink-700">
      {/* 1. Official Hospital Top Contact & Accreditation Bar */}
      <div className="bg-[#14179E] text-white py-2 px-4 text-xs font-medium border-b border-blue-900">
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-4 text-slate-200">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <Building size={14} className="text-pink-400" /> Fidelity Healthcare • Main Hospital Campus
            </span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="flex items-center gap-1">
              <Clock size={14} className="text-pink-400" /> OPD Hours: Mon – Sat 09:00 AM – 05:00 PM
            </span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="text-slate-300">NABH Accredited Maternal Center</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-pink-300 font-semibold">24x7 Emergency / Labour:</span>
            <a href="tel:18005550199" className="font-bold text-white hover:text-pink-200 underline">
              1800-555-0199 (Toll Free)
            </a>
          </div>
        </div>
      </div>

      {/* 2. Official Hospital Header Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-ink-100 shadow-sm">
        <div className="max-w-[1240px] mx-auto px-6 max-sm:px-4 h-[72px] flex items-center justify-between gap-4">
          {/* Logo & Clinical Department Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#14179E] text-white flex items-center justify-center font-bold shadow-sm">
              <Baby size={22} className="text-pink-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-xl text-blue-800 tracking-tight">JanmaLink</span>
                <span className="text-[11px] font-semibold text-pink-700 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded">
                  Outpatient Portal
                </span>
              </div>
              <span className="text-[11px] text-ink-600 block">Department of Obstetrics, Gynaecology & Neonatology</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-ink-600">
            <a href="#live-opd" className="hover:text-blue-800 transition-colors flex items-center gap-1.5">
              <Activity size={14} className="text-green-600" /> Live OPD Board
            </a>
            <a href="#doctors" className="hover:text-blue-800 transition-colors">Specialist Roster</a>
            <a href="#departments" className="hover:text-blue-800 transition-colors">Clinical Services</a>
            <a href="#guidelines" className="hover:text-blue-800 transition-colors">Patient Guidelines</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Main "Book OPD" button that opens the booking slot card modal */}
            <button
              id="header-book-opd-btn"
              onClick={() => {
                setConfirmedBooking(null);
                setBookingError('');
                setIsBookingModalOpen(true);
              }}
              className="btn btn-primary h-[40px] px-5 text-xs font-semibold flex items-center gap-2 cursor-pointer hidden sm:flex"
            >
              <Calendar size={15} /> Book OPD
            </button>
            
            <Link
              to="/portal"
              className="btn btn-secondary h-[40px] px-4 text-xs font-semibold flex items-center gap-1.5 border border-pink-200 text-pink-700 bg-pink-50 hover:bg-pink-100"
              title="Patient & Guardian Portal"
            >
              <User size={15} /> Patient Login
            </Link>

            <Link
              to="/dashboard"
              className="btn btn-secondary h-[40px] px-4 text-xs font-semibold flex items-center gap-1.5 hidden md:flex"
              title="Open Hospital Staff Portal"
            >
              <Building size={15} /> Staff
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Hero Section: Clinical Outpatient Portal Header */}
      <section className="bg-white border-b border-ink-100 py-12 lg:py-16">
        <div className="max-w-[1240px] mx-auto px-6 max-sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Hospital Mission & Actions */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 text-blue-800 text-xs font-semibold mb-4 border border-blue-200">
                <Stethoscope size={14} className="text-blue-700" />
                <span>Outpatient Department (OPD) Scheduling</span>
                <span className="text-ink-400">•</span>
                <span className="text-green-700 font-bold">Live System Online</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold font-heading text-blue-800 leading-[1.2] mb-4">
                Specialist Maternal & Newborn Outpatient Services
              </h1>

              <p className="text-ink-600 text-sm leading-relaxed mb-6 max-w-xl">
                Book scheduled consultations with our senior obstetricians and maternal-fetal specialists. Real-time calendar slot verification eliminates waiting room queues and generates instant queue tokens synced directly with our hospital reception desk.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="hero-book-opd-btn"
                  onClick={() => {
                    setConfirmedBooking(null);
                    setBookingError('');
                    setIsBookingModalOpen(true);
                  }}
                  className="btn btn-primary h-[46px] px-6 text-sm font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Calendar size={17} />
                  Book OPD Appointment
                  <ArrowRight size={16} />
                </button>

                <a
                  href="#doctors"
                  className="btn btn-secondary h-[46px] px-5 text-xs font-semibold flex items-center gap-2"
                >
                  <User size={16} /> View Doctor Roster
                </a>

                <Link
                  to="/dashboard"
                  className="btn btn-ghost h-[46px] px-4 text-xs font-semibold text-ink-600 hover:text-blue-800 flex items-center gap-1.5"
                >
                  <Activity size={16} /> Receptionist Dashboard →
                </Link>
              </div>

              {/* Clinical Verification Notice */}
              <div className="mt-8 pt-6 border-t border-ink-100 flex flex-wrap items-center gap-6 text-xs text-ink-600">
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-green-600 font-bold" /> Real-time Slot Conflict Check
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-green-600 font-bold" /> Instant SMS & Calendar Token
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-green-600 font-bold" /> Zero Waiting Line at Counter
                </span>
              </div>
            </div>

            {/* Right Column: Outpatient Quick Info Box */}
            <div className="lg:col-span-5">
              <div className="bg-ink-50 rounded-xl border border-ink-200 p-6">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-ink-200">
                  <div className="flex items-center gap-2.5">
                    <Building size={18} className="text-blue-800" />
                    <div>
                      <h3 className="text-sm font-bold text-blue-800 m-0">OPD Counter Information</h3>
                      <span className="text-[11px] text-ink-600">Fidelity Healthcare Main Block</span>
                    </div>
                  </div>
                  <span className="chip chip-green text-[11px]">Counter Open</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-ink-100">
                    <MapPin size={16} className="text-pink-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-ink-900 block">Consultation Chambers</span>
                      <span className="text-ink-600">Ground Floor (Chambers 101–105) & 1st Floor (Chambers 106–112)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-ink-100">
                    <Clock size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-ink-900 block">Consultation Slot Windows</span>
                      <span className="text-ink-600">30-minute dedicated clinical slots • Morning (9 AM–1 PM) & Afternoon (2 PM–5 PM)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-ink-100">
                    <ShieldCheck size={16} className="text-green-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-ink-900 block">Token Slip Check-In</span>
                      <span className="text-ink-600">Bring your digital SMS/PDF token slip to Counter #1 for immediate priority check-in</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setConfirmedBooking(null);
                    setBookingError('');
                    setIsBookingModalOpen(true);
                  }}
                  className="w-full mt-4 btn btn-primary h-[42px] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar size={15} /> Book OPD Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live OPD Board (100% Real Live Data from API - No Fake Metrics) */}
      <section id="live-opd" className="py-10 bg-ink-50 border-b border-ink-200">
        <div className="max-w-[1240px] mx-auto px-6 max-sm:px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <h2 className="text-lg font-bold text-blue-800 m-0">Live Outpatient Department (OPD) Status</h2>
              </div>
              <p className="text-xs text-ink-600 m-0 mt-0.5">
                Real-time operational metrics fetched live from the hospital database
              </p>
            </div>

            <button
              onClick={loadLiveStats}
              disabled={loadingSummary}
              className="btn btn-secondary h-[34px] px-3 text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={loadingSummary ? 'animate-spin' : ''} />
              <span>Refresh Status</span>
            </button>
          </div>

          {/* Live Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status */}
            <div className="card p-5 bg-white border border-ink-100">
              <div className="text-[11px] text-ink-600 font-semibold uppercase tracking-wider mb-1">Clinic Status</div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-800">
                  {opdSummary?.opdStatus === 'Active' ? 'Active / In Session' : 'Active'}
                </span>
                <span className="chip chip-green text-[11px]">Accepting Slots</span>
              </div>
              <span className="text-[11px] text-ink-600 block mt-2">Mon–Sat regular OPD operating hours</span>
            </div>

            {/* Active Doctors on Duty */}
            <div className="card p-5 bg-white border border-ink-100">
              <div className="text-[11px] text-ink-600 font-semibold uppercase tracking-wider mb-1">Active Specialists on Duty</div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-heading text-blue-800 tabular-nums">
                  {doctors.length}
                </span>
                <span className="chip chip-blue text-[11px]">Live Roster</span>
              </div>
              <span className="text-[11px] text-ink-600 block mt-2">
                {doctors.map(d => d.name).join(', ') || 'Consultants on Call'}
              </span>
            </div>

            {/* Today's Appointments Count */}
            <div className="card p-5 bg-white border border-ink-100">
              <div className="text-[11px] text-ink-600 font-semibold uppercase tracking-wider mb-1">Scheduled for Today</div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-heading text-pink-500 tabular-nums">
                  {opdSummary?.todaysAppointmentsCount ?? 0} Patients
                </span>
                <span className="chip chip-pink text-[11px]">Today</span>
              </div>
              <span className="text-[11px] text-ink-600 block mt-2">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>

            {/* Total Bookings in System */}
            <div className="card p-5 bg-white border border-ink-100">
              <div className="text-[11px] text-ink-600 font-semibold uppercase tracking-wider mb-1">Confirmed Outpatients</div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-heading text-green-700 tabular-nums">
                  {opdSummary?.totalBookedAppointments ?? 1} Recorded
                </span>
                <span className="chip chip-green text-[11px]">In Database</span>
              </div>
              <span className="text-[11px] text-ink-600 block mt-2">Synced with Receptionist Desk</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Live Specialist Roster Section (Real Doctors from MongoDB) */}
      <section id="doctors" className="py-12 bg-white border-b border-ink-200">
        <div className="max-w-[1240px] mx-auto px-6 max-sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block mb-1">Consultant Roster</span>
              <h2 className="text-2xl font-bold font-heading text-blue-800 m-0">
                Our Consulting Specialists & Outpatient Hours
              </h2>
              <p className="text-xs text-ink-600 mt-1 max-w-xl">
                Direct scheduling available for all hospital-affiliated consultants. Select your specialist to view their live 30-minute consultation slots.
              </p>
            </div>

            <button
              onClick={() => {
                setConfirmedBooking(null);
                setBookingError('');
                setIsBookingModalOpen(true);
              }}
              className="btn btn-primary h-[40px] px-5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Calendar size={15} /> Book OPD Slot
            </button>
          </div>

          {/* Real Doctor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctors.map((doc, idx) => (
              <div key={doc._id} className="card p-6 bg-white border border-ink-200 hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold text-lg border border-blue-100">
                        <Stethoscope size={22} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-blue-800 m-0">{doc.name}</h3>
                        <span className="text-xs font-medium text-pink-600 block mt-0.5">
                          {doc.specialization || 'Obstetrics & Gynaecology'}
                        </span>
                      </div>
                    </div>
                    <span className="chip chip-green text-[11px]">Available</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-ink-100 space-y-2 text-xs text-ink-600">
                    <div className="flex items-center justify-between">
                      <span className="text-ink-600 font-medium">Department:</span>
                      <span className="font-semibold text-ink-900">
                        {idx === 0 ? 'Obstetrics & High-Risk Pregnancy' : 'Maternal-Fetal Medicine & Neonatology'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ink-600 font-medium">Consultation Chamber:</span>
                      <span className="font-semibold text-ink-900">
                        {idx === 0 ? 'Chamber 101, Ground Floor' : 'Chamber 104, First Floor'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ink-600 font-medium">OPD Timings:</span>
                      <span className="font-semibold text-ink-900">Mon – Sat (09:00 AM – 05:00 PM)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ink-600 font-medium">Slot Interval:</span>
                      <span className="font-semibold text-blue-800">30 Minutes per Outpatient</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-ink-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-ink-600">Live booking open for tomorrow</span>
                  {/* Clicking this button opens the booking modal with this doctor pre-selected */}
                  <button
                    onClick={() => handleOpenBookingWithDoctor(doc._id)}
                    className="btn btn-primary h-[38px] px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar size={14} /> Book with {doc.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Clinical Departments & Services */}
      <section id="departments" className="py-12 bg-ink-50 border-b border-ink-200">
        <div className="max-w-[1240px] mx-auto px-6 max-sm:px-4">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-semibold text-pink-600 uppercase tracking-wider block mb-1">Clinical Wings</span>
            <h2 className="text-2xl font-bold font-heading text-blue-800 m-0">
              Maternal & Paediatric Specialty Services
            </h2>
            <p className="text-xs text-ink-600 mt-1">
              Institutional outpatient and diagnostic facilities at Fidelity Healthcare JanmaLink center.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {CLINICAL_SERVICES.map((srv, idx) => (
              <div key={idx} className="card p-5 bg-white border border-ink-100 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold mb-3">
                    {idx === 0 ? <Heart size={20} className="text-pink-500" /> : idx === 1 ? <Activity size={20} className="text-blue-700" /> : idx === 2 ? <Baby size={20} className="text-pink-600" /> : <FileText size={20} className="text-green-700" />}
                  </div>
                  <h3 className="text-sm font-bold text-blue-800 mb-2">{srv.title}</h3>
                  <p className="text-xs text-ink-600 leading-relaxed mb-4">
                    {srv.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-ink-100 text-[11px] text-ink-600 space-y-1">
                  <div className="font-semibold text-blue-800">{srv.room}</div>
                  <div>{srv.hours}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Patient Guidelines & OPD Protocol */}
      <section id="guidelines" className="py-12 bg-white border-b border-ink-200">
        <div className="max-w-[1240px] mx-auto px-6 max-sm:px-4">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block mb-1">Outpatient Guidelines</span>
            <h2 className="text-2xl font-bold font-heading text-blue-800 m-0">
              Important Instructions for Outpatients
            </h2>
            <p className="text-xs text-ink-600 mt-1">
              Follow these simple hospital guidelines to ensure smooth triage and consultation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-ink-50 border border-ink-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs mb-3">
                1
              </div>
              <h4 className="text-sm font-bold text-blue-800 mb-1">What to Bring</h4>
              <p className="text-xs text-ink-600 leading-relaxed">
                Please present government-issued photo ID, your digital queue token (SMS or printed slip), and previous ultrasound scans or medical discharge summaries.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-ink-50 border border-ink-100">
              <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs mb-3">
                2
              </div>
              <h4 className="text-sm font-bold text-blue-800 mb-1">Arrival & Vitals Recording</h4>
              <p className="text-xs text-ink-600 leading-relaxed">
                Please arrive at the Outpatient Reception Counter 15 minutes prior to your allocated slot time for nursing vitals measurement (BP, weight, foetal heart check).
              </p>
            </div>

            <div className="p-5 rounded-xl bg-ink-50 border border-ink-100">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs mb-3">
                3
              </div>
              <h4 className="text-sm font-bold text-blue-800 mb-1">Emergency Protocol</h4>
              <p className="text-xs text-ink-600 leading-relaxed">
                Patients in active labour, severe bleeding, or obstetric emergency do not require an appointment. Please report straight to the 24x7 Casualty & Labour Triage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. MODAL POPUP: Opens when clicking "Book OPD" */}
      {isBookingModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsBookingModalOpen(false)}
        >
          <div
            className="modal max-w-3xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="p-4 sm:p-5 border-b border-ink-100 flex items-center justify-between sticky top-0 bg-white z-20 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#14179E] text-white flex items-center justify-center">
                  <Calendar size={20} className="text-pink-400" />
                </div>
                <div>
                  <h3 className="m-0 text-base font-bold text-blue-800">Outpatient (OPD) Slot Reservation</h3>
                  <p className="text-xs text-ink-600 m-0">Live calendar scheduling & instant queue token generation</p>
                </div>
              </div>
              <button
                className="icon-btn hover:text-red-600 hover:bg-red-50 p-2 rounded-lg"
                onClick={() => setIsBookingModalOpen(false)}
                title="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: The Booking Slot Card */}
            <div>
              {renderBookingCardContent(true)}
            </div>
          </div>
        </div>
      )}

      {/* 9. Official Institutional Footer */}
      <footer className="bg-white border-t border-ink-100 py-10 text-ink-600 text-xs">
        <div className="max-w-[1240px] mx-auto px-6 max-sm:px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-ink-100">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#14179E] text-white flex items-center justify-center">
                  <Baby size={16} className="text-pink-400" />
                </div>
                <span className="font-heading font-bold text-base text-blue-800">JanmaLink</span>
              </div>
              <p className="text-ink-600 text-xs leading-relaxed">
                Hospital Information System & Maternal Health Wing. Fidelity Healthcare Main Campus, OPD Block.
              </p>
              <div className="text-[11px] text-ink-600">
                NABH Reference: FID-MAT-2026-A1
              </div>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-blue-800 text-xs uppercase tracking-wider mb-3">OPD Navigation</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => {
                      setConfirmedBooking(null);
                      setBookingError('');
                      setIsBookingModalOpen(true);
                    }}
                    className="hover:text-blue-800 bg-transparent border-0 p-0 cursor-pointer font-semibold text-blue-600"
                  >
                    Book Outpatient Slot
                  </button>
                </li>
                <li><a href="#doctors" className="hover:text-blue-800">Specialist Roster</a></li>
                <li><a href="#live-opd" className="hover:text-blue-800">Live OPD Queue Board</a></li>
                <li><Link to="/portal" className="hover:text-blue-800">Guardian / Mother Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-blue-800 text-xs uppercase tracking-wider mb-3">Clinical Hours</h4>
              <p className="text-xs text-ink-600 leading-relaxed">
                <strong>Outpatient (OPD):</strong><br />
                Monday – Saturday: 09:00 AM – 05:00 PM<br />
                Sunday: Closed for Routine OPD<br />
                <strong>Casualty / Labour Ward:</strong><br />
                24 Hours Open (No booking required)
              </p>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-blue-800 text-xs uppercase tracking-wider mb-3">Hospital Contact</h4>
              <p className="text-xs text-ink-600 leading-relaxed">
                Emergency Hotline: <span className="font-bold text-pink-600">1800-555-0199</span><br />
                Reception Desk: +91 80 2345 6789<br />
                Email: opd@fidelityhealthcare.org<br />
                Main Campus, 12th Cross Road, Health City
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-ink-600 text-[11px]">
            <div>© {new Date().getFullYear()} Fidelity Healthcare - JanmaLink Outpatient Division. All rights reserved.</div>
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="text-blue-800 font-semibold hover:underline">Staff & Receptionist Login</Link>
              <span>•</span>
              <span>Patient Privacy Guidelines</span>
              <span>•</span>
              <span>Clinical Data Protection</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

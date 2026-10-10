import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, User, Phone, Mail, Stethoscope, 
  CheckCircle2, ArrowRight, Loader, AlertCircle, Sparkles, 
  MapPin, ShieldCheck, HeartPulse, ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDoctors, fetchAvailableSlots, bookAppointmentPublic } from '../services/api';

export const BookingModal = ({ isOpen, onClose, preselectedDoctor = null }) => {
  const [step, setStep] = useState(1); // 1: Select Doctor & Slot, 2: Patient Details, 3: Confirmed
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  
  // Tomorrow as default date (YYYY-MM-DD)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState(defaultDateStr);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsData, setSlotsData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Patient Info
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consultationType, setConsultationType] = useState('antenatal');
  const [reason, setReason] = useState('Routine Trimester Clinical Review');

  // Booking result & error
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Load doctors on mount
  useEffect(() => {
    if (!isOpen) return;
    
    fetchDoctors().then(docs => {
      setDoctors(docs || []);
      if (preselectedDoctor?._id) {
        setSelectedDoctorId(preselectedDoctor._id);
      } else if (docs && docs.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(docs[0]._id);
      }
    });
  }, [isOpen, preselectedDoctor]);

  // Load slots when doctor or date changes
  useEffect(() => {
    if (!isOpen || !selectedDoctorId || !selectedDate) return;

    setSlotsLoading(true);
    setSelectedSlot(null);
    fetchAvailableSlots(selectedDoctorId, selectedDate)
      .then(data => {
        setSlotsData(data);
        if (data?.slots) {
          const firstAvailable = data.slots.find(s => s.available);
          if (firstAvailable) setSelectedSlot(firstAvailable);
        }
      })
      .catch(err => {
        console.warn('Failed to load slots:', err);
      })
      .finally(() => {
        setSlotsLoading(false);
      });
  }, [isOpen, selectedDoctorId, selectedDate]);

  if (!isOpen) return null;

  const currentDoctor = doctors.find(d => d._id === selectedDoctorId) || preselectedDoctor;

  const handleNextToDetails = (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setBookingError('Please select an available consultation time slot.');
      return;
    }
    setBookingError(null);
    setStep(2);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!patientName.trim() || !phone.trim()) {
      setBookingError('Please enter mother/patient name and valid phone number.');
      return;
    }

    setSubmitting(true);
    setBookingError(null);

    try {
      const payload = {
        patientName: patientName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        doctor: selectedDoctorId,
        date: selectedDate,
        time: selectedSlot.time,
        slotStart: selectedSlot.slotStart,
        slotEnd: selectedSlot.slotEnd,
        type: consultationType,
        reason: reason.trim()
      };

      const result = await bookAppointmentPublic(payload);
      setConfirmedBooking(result);
      setStep(3);
    } catch (err) {
      console.error('Booking submission error:', err);
      setBookingError(err.message || 'Could not complete appointment booking. Please try another slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedSlot(null);
    setBookingError(null);
    setConfirmedBooking(null);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans"
      onClick={resetAndClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-4 max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between border-b border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#76C0EC] to-blue-600 flex items-center justify-center shadow-md">
              <Stethoscope size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white m-0 font-heading">
                  Book Maternity Consultation
                </h3>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                  Instant OPD Token
                </span>
              </div>
              <p className="text-xs text-blue-200/80 m-0 mt-0.5">
                Official hospital appointment booking with live token allocation
              </p>
            </div>
          </div>

          <button 
            onClick={resetAndClose}
            className="p-2 text-blue-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer border-0 bg-transparent"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {bookingError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{bookingError}</span>
            </div>
          )}

          {/* STEP 1: SELECT DOCTOR, DATE & TIME SLOT */}
          {step === 1 && (
            <form onSubmit={handleNextToDetails} className="space-y-6">
              
              {/* Doctor Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Select Maternity Specialist
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doctors.map(doc => {
                    const isSelected = selectedDoctorId === doc._id;
                    return (
                      <div
                        key={doc._id}
                        onClick={() => setSelectedDoctorId(doc._id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected 
                            ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-sm' 
                            : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {doc.name.replace('Dr. ', '').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate m-0">{doc.name}</h4>
                          <p className="text-[11px] text-pink-600 font-medium truncate m-0 mt-0.5">
                            {doc.specialization || 'Obstetrics & Gynaecology'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Consultation Date */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Calendar size={14} className="text-blue-600" /> Appointment Date
                </label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Live Time Slots */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-600" /> Available Consultation Slots
                  </label>
                  {slotsData && (
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      {slotsData.availableCount} slots available
                    </span>
                  )}
                </div>

                {slotsLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Loader size={20} className="animate-spin text-blue-500" />
                    <span className="text-xs font-medium">Checking doctor's clinical schedule...</span>
                  </div>
                ) : !slotsData?.slots?.length ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No slots found for this date.</p>
                ) : (
                  <div className="space-y-4">
                    {/* Morning Slots */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                        Morning Clinic
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {slotsData.slots.filter(s => s.period === 'Morning').map((slot, i) => {
                          const isSelected = selectedSlot?.time === slot.time;
                          return (
                            <button
                              key={i}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border cursor-pointer ${
                                !slot.available 
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed line-through'
                                  : isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                              }`}
                            >
                              <span>{slot.time}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Afternoon Slots */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                        Afternoon Clinic
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {slotsData.slots.filter(s => s.period === 'Afternoon').map((slot, i) => {
                          const isSelected = selectedSlot?.time === slot.time;
                          return (
                            <button
                              key={i}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border cursor-pointer ${
                                !slot.available 
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed line-through'
                                  : isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                              }`}
                            >
                              <span>{slot.time}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  {selectedSlot ? (
                    <span>Selected: <strong className="text-slate-800">{selectedSlot.time}</strong> on {selectedDate}</span>
                  ) : (
                    <span className="text-amber-600">Please choose an available slot</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!selectedSlot || slotsLoading}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  Proceed to Details <ArrowRight size={15} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: MOTHER / PATIENT DETAILS */}
          {step === 2 && (
            <form onSubmit={handleConfirmBooking} className="space-y-5">
              
              {/* Selected Slot Recap Card */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-pink-50/40 rounded-2xl border border-blue-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 m-0">{currentDoctor?.name || 'Specialist'}</h4>
                    <p className="text-[11px] text-slate-600 m-0 mt-0.5">
                      {selectedDate} at <strong>{selectedSlot?.time}</strong>
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-xs text-blue-600 font-bold hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Change Slot
                </button>
              </div>

              {/* Patient Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Mother / Patient Full Name *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Phone Number (for SMS & OTP) *
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. priya@example.com"
                      className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Consultation Type & Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Consultation Type
                  </label>
                  <select 
                    value={consultationType}
                    onChange={e => setConsultationType(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="antenatal">Antenatal Routine Checkup</option>
                    <option value="consultation">Ultrasound & Anomaly Scan Review</option>
                    <option value="followup">High-Risk Pregnancy Review</option>
                    <option value="paediatric">Postnatal Maternal & Infant Care</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Reason / Primary Symptoms
                  </label>
                  <input 
                    type="text" 
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="e.g. Routine 2nd Trimester review"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                  className="btn btn-outline border-slate-200 text-slate-600 font-semibold text-xs py-2.5 px-5 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-7 rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="animate-spin" /> Confirming OPD Booking...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} /> Confirm & Generate Token
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: BOOKING CONFIRMED SCREEN */}
          {step === 3 && confirmedBooking && (
            <div className="text-center py-4 space-y-6 animate-fade-in">
              <div className="w-18 h-18 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 border-4 border-white ring-4 ring-emerald-50">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 block mb-1">
                  Appointment Confirmed
                </span>
                <h3 className="text-2xl font-black font-heading text-slate-900 m-0">
                  OPD Token #{confirmedBooking.tokenNo || '1'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 m-0">
                  Booking Reference: <strong className="font-mono text-slate-800">{confirmedBooking.bookingReference}</strong>
                </p>
              </div>

              {/* Confirmation Details Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left space-y-3 text-xs max-w-lg mx-auto">
                <div className="flex justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500">Patient Name:</span>
                  <strong className="text-slate-900">{confirmedBooking.patientName || patientName}</strong>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500">Doctor Assigned:</span>
                  <strong className="text-slate-900">{confirmedBooking.doctor?.name || currentDoctor?.name}</strong>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <strong className="text-slate-900">{selectedDate}</strong>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500">Time Window:</span>
                  <strong className="text-blue-700">{selectedSlot?.time}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <strong className="text-slate-900">Maternity OPD Wing, Ground Floor</strong>
                </div>
              </div>

              {/* SMS Dispatch Notice */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs font-medium max-w-lg mx-auto flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600 shrink-0" />
                <span>SMS confirmation has been dispatched to <strong>{phone}</strong>. Please arrive 15 minutes prior.</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/portal"
                  onClick={resetAndClose}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                >
                  Open Guardian Portal <ArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default BookingModal;

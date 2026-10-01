import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Activity,
  Baby,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  X,
  Clock,
  Filter,
  TrendingUp,
  RefreshCw,
  Globe,
  CheckCircle2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { fetchAppointments, updateAppointmentStatus, fetchDashboardStats } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Date filter: empty string '' means "All Dates" so all live bookings are visible immediately
  const [calendarDate, setCalendarDate] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('All');
  
  // Live Data from API (ZERO fake mock data)
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  const [stats, setStats] = useState({
    todaysAppointments: 0,
    totalAppointments: 0,
    activePregnancies: 0,
    highRiskPregnancies: 0,
    totalPatients: 0,
    deliveriesCount: 0
  });

  const [highRiskPatients, setHighRiskPatients] = useState([]);

  // Fetch all real live data from Backend API
  const loadLiveDashboard = async () => {
    setSyncing(true);
    try {
      const [aptData, statsData] = await Promise.all([
        fetchAppointments(calendarDate ? { date: calendarDate } : {}),
        fetchDashboardStats()
      ]);

      if (Array.isArray(aptData)) {
        const mapped = aptData.map(apt => ({
          id: apt._id,
          time: apt.displayTime || new Date(apt.slotStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          date: new Date(apt.slotStart).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
          patient: apt.patientDisplayName || apt.patientName || apt.patient?.name || 'Patient',
          patientId: apt.patientDisplayId || apt.patient?.motherId || apt.bookingReference || 'Online Booking',
          doctor: apt.doctorDisplayName || apt.doctor?.name || 'Assigned Specialist',
          type: apt.type ? apt.type.charAt(0).toUpperCase() + apt.type.slice(1) : 'Consultation',
          status: apt.status === 'checked_in' ? 'Checked In' : (apt.status === 'completed' ? 'Completed' : 'Booked'),
          token: apt.tokenNo || 1,
          source: apt.source || 'online',
          phone: apt.patientPhone || apt.patient?.phone || '',
          bookingReference: apt.bookingReference
        }));
        setAppointments(mapped);
      } else {
        setAppointments([]);
      }

      if (statsData) {
        setStats(statsData);
        if (Array.isArray(statsData.highRiskList)) {
          setHighRiskPatients(statsData.highRiskList);
        }
      }

      setLastSyncTime(new Date());
    } catch (e) {
      console.warn('Dashboard API sync warning:', e);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveDashboard();
    const timer = setInterval(loadLiveDashboard, 15000); // 15s auto-poll
    return () => clearInterval(timer);
  }, [calendarDate]);

  // Handle Check In
  const handleCheckIn = async (aptId) => {
    // Optimistic UI update
    setAppointments(prev => prev.map(item => item.id === aptId ? { ...item, status: 'Checked In' } : item));
    try {
      await updateAppointmentStatus(aptId, 'checked_in');
      loadLiveDashboard();
    } catch (err) {
      console.warn('Failed to update check in status on backend:', err);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (doctorFilter !== 'All' && apt.doctor !== doctorFilter) return false;
    return true;
  });

  return (
    <div className="pb-6 min-w-0">
      {/* Online Booking Banner */}
      <div className="mb-6 p-4 rounded-card bg-gradient-to-r from-blue-50 via-white to-pink-50 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Globe size={20} />
          </div>
          <div>
            <div className="font-heading font-semibold text-blue-800 text-sm flex items-center gap-2">
              Public Outpatient Portal & Live Queue Active
              <span className="chip chip-green text-[11px] h-[20px]">Real API Data</span>
            </div>
            <p className="text-xs text-ink-600 m-0 mt-0.5">
              Appointments booked online by patients are synced live with this Receptionist Dashboard.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadLiveDashboard}
            disabled={syncing}
            className="btn btn-secondary h-[36px] text-xs font-semibold flex items-center gap-1.5 bg-white cursor-pointer"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Refresh Queue'}
          </button>
          <Link
            to="/"
            target="_blank"
            className="btn btn-primary h-[36px] text-xs font-semibold flex items-center gap-1.5"
          >
            Open Patient Website <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-[28px] leading-[36px] max-sm:text-[22px] max-sm:leading-[30px] font-semibold m-0 text-blue-800 font-heading">
          Clinical & Receptionist Dashboard
        </h1>
        <p className="text-ink-600 text-[14px] leading-[22px] m-0">
          Live outpatient queue, patient check-in management, and high-risk pregnancy monitoring.
        </p>
      </div>

      {/* Top Real Metrics Row (All fetched live from API) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-sm:gap-4 mb-6">
        <div className="card flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-600 leading-[20px] truncate">
              Total Outpatient Bookings
            </span>
            <div className="w-[40px] h-[40px] rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar size={20} />
            </div>
          </div>
          <div>
            <div className="text-[32px] font-semibold font-heading text-blue-800 leading-[40px] mb-1 tabular-nums">
              {stats.totalAppointments || appointments.length}
            </div>
            <div className="text-[12px] leading-[18px] font-medium text-green-700 flex items-center gap-1.5">
              <TrendingUp size={15} /> Synced live ({lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </div>
          </div>
        </div>

        <div className="card flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-600 leading-[20px] truncate">
              Active Pregnancies
            </span>
            <div className="w-[40px] h-[40px] rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="text-[32px] font-semibold font-heading text-blue-800 leading-[40px] mb-1 tabular-nums">
              {stats.activePregnancies}
            </div>
            <div className="text-[12px] leading-[18px] font-medium text-ink-600">Active ongoing records in DB</div>
          </div>
        </div>

        <div className="card flex flex-col justify-between min-h-[120px] relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-amber-600" />
          <div className="flex justify-between items-center mb-3">
            <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-600 leading-[20px] truncate">
              High-Risk Alerts
            </span>
            <div className="w-[40px] h-[40px] rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div className="text-[32px] font-semibold font-heading text-amber-700 leading-[40px] mb-1 tabular-nums">
              {stats.highRiskPregnancies}
            </div>
            <div className="text-[12px] leading-[18px] font-medium text-amber-700">Requires clinical triage</div>
          </div>
        </div>

        <div className="card flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-600 leading-[20px] truncate">
              Registered Patients
            </span>
            <div className="w-[40px] h-[40px] rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div>
            <div className="text-[32px] font-semibold font-heading text-blue-800 leading-[40px] mb-1 tabular-nums">
              {stats.totalPatients}
            </div>
            <div className="text-[12px] leading-[18px] font-medium text-ink-600">Mothers & Babies recorded</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-sm:gap-4 items-stretch">
        {/* Left Column: Real Appointments Queue */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6 max-sm:gap-4 min-w-0">
          <div className="card !p-0 overflow-hidden flex flex-col">
            <div className="p-6 max-sm:p-4 pb-4 flex justify-between items-start max-sm:flex-col gap-3 border-b border-ink-100">
              <div>
                <h3 className="m-0 text-[16px] leading-[24px]">Receptionist Outpatient Queue</h3>
                <p className="text-xs text-ink-600 m-0 mt-0.5">
                  {calendarDate ? `Showing slots for ${calendarDate}` : 'All active appointments in hospital database'}
                </p>
              </div>

              {/* Date Filters */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  className={`btn h-[32px] text-xs px-3 font-semibold ${calendarDate === '' ? 'btn-primary' : 'btn-secondary bg-white'}`}
                  onClick={() => setCalendarDate('')}
                >
                  All Bookings ({appointments.length})
                </button>

                <button
                  className="btn btn-secondary h-[32px] bg-white text-xs px-3 font-semibold flex items-center gap-1.5"
                  onClick={() => setShowCalendar(true)}
                >
                  <Calendar size={14} /> Filter Date
                </button>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="table-responsive hidden md:block">
              {loading ? (
                <div className="p-8 text-center text-xs text-ink-600">
                  <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-blue-600" />
                  Loading live queue from server...
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="p-8 text-center text-xs text-ink-600">
                  <p className="font-semibold text-ink-900 mb-1">No appointments found for this filter.</p>
                  <p className="mb-3">Patients who book on the website will automatically appear here.</p>
                  <button
                    onClick={() => setCalendarDate('')}
                    className="btn btn-secondary h-[30px] text-xs"
                  >
                    View All Recorded Appointments
                  </button>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-ink-100 bg-ink-50/50">
                      <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ width: '80px' }}>Token</th>
                      <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ width: '130px' }}>Date & Time</th>
                      <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ minWidth: '180px' }}>Patient Details</th>
                      <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ width: '140px' }}>Consulting Doctor</th>
                      <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ width: '110px' }}>Source</th>
                      <th className="px-4 py-3 font-semibold text-ink-900 text-[13px]" style={{ width: '120px' }}>Status / Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((apt) => (
                      <tr key={apt.id} className="border-b border-ink-50 hover:bg-blue-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="chip chip-ink font-bold text-xs">#{apt.token}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-ink-900 text-xs">{apt.time}</div>
                          <div className="text-[11px] text-ink-600">{apt.date}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-blue-800 text-[14px]">
                            {apt.patient}
                          </div>
                          <div className="text-[11px] text-ink-600 flex items-center gap-1 mt-0.5">
                            <span className="font-mono">{apt.patientId}</span>
                            {apt.phone && <span>• {apt.phone}</span>}
                          </div>
                          {apt.bookingReference && (
                            <div className="text-[10px] text-ink-400 font-mono mt-0.5">
                              Ref: {apt.bookingReference}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-ink-900 text-xs font-semibold">{apt.doctor}</div>
                          <div className="text-[11px] text-pink-600">{apt.type}</div>
                        </td>
                        <td className="px-4 py-3">
                          {apt.source === 'online' ? (
                            <span className="chip chip-pink text-[11px] gap-1">
                              <Globe size={11} /> Online
                            </span>
                          ) : (
                            <span className="chip chip-blue text-[11px]">Reception</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {apt.status === 'Checked In' ? (
                            <span className="chip chip-green text-[11px]">
                              <CheckCircle2 size={12} /> Checked In
                            </span>
                          ) : (
                            <button
                              className="btn btn-secondary h-[28px] text-[11px] px-2.5 font-semibold hover:bg-green-50 hover:text-green-700 hover:border-green-300 cursor-pointer"
                              onClick={() => handleCheckIn(apt.id)}
                            >
                              Check In
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-3 p-4 bg-ink-50">
              {filteredAppointments.map((apt) => (
                <div key={apt.id} className="bg-white rounded-xl p-4 border border-ink-100 flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="chip chip-ink font-bold text-[11px] mb-1">Token #{apt.token}</span>
                      <div className="text-blue-800 font-semibold text-[15px]">
                        {apt.patient}
                      </div>
                      <div className="text-xs text-ink-600">{apt.doctor} • {apt.type}</div>
                    </div>
                    {apt.status === 'Checked In' ? (
                      <span className="chip chip-green text-xs">Checked In</span>
                    ) : (
                      <button
                        className="btn btn-secondary h-[28px] text-[12px] px-3 cursor-pointer"
                        onClick={() => handleCheckIn(apt.id)}
                      >
                        Check In
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] text-ink-600 flex items-center justify-between border-t border-ink-100 pt-2 mt-1">
                    <span className="font-semibold text-ink-900">{apt.date} at {apt.time}</span>
                    <span className="chip chip-pink text-[10px]">{apt.source === 'online' ? 'Online Booking' : 'Walk-in'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Rail: Real High Risk Patients from DB */}
        <div className="col-span-1 flex flex-col h-full min-w-0">
          <div className="card h-full flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="w-[36px] h-[36px] rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <h3 className="m-0 text-[16px] leading-[24px]">High-Risk Alerts</h3>
              </div>
              <span className="chip chip-amber text-[11px]">{highRiskPatients.length} Active</span>
            </div>

            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
              {highRiskPatients.length === 0 ? (
                <div className="p-4 text-center text-xs text-ink-600 bg-ink-50 rounded-xl">
                  No high-risk pregnancy alerts flagged in database.
                </div>
              ) : (
                highRiskPatients.map((patient, i) => (
                  <div
                    key={i}
                    className="group grid grid-cols-[1fr_auto] gap-3 items-center p-3.5 rounded-xl border border-ink-100 cursor-pointer hover:bg-pink-50 transition-colors"
                    onClick={() => navigate('/patients/search')}
                  >
                    <div className="flex flex-col items-start min-w-0">
                      <span className="font-semibold text-blue-800 text-[14px] truncate w-full">
                        {patient.name}
                      </span>
                      <div className="text-[12px] text-ink-600 mt-0.5 mb-1.5 truncate w-full">
                        <span className="font-mono text-ink-900 font-semibold">{patient.id}</span>
                        <span className="mx-1.5 text-ink-400">•</span>
                        EDD: {patient.edd}
                      </div>
                      <div className="chip chip-red text-[11px]">
                        <AlertTriangle size={11} /> <span className="truncate">{patient.reason}</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-ink-400 group-hover:text-pink-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))
              )}
            </div>

            <button
              className="mt-4 pt-3 w-full btn btn-secondary border border-blue-200 bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 cursor-pointer"
              onClick={() => navigate('/patients/search')}
            >
              View Registered Patients
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Filter Modal */}
      {showCalendar && (
        <div className="modal-overlay" onClick={() => setShowCalendar(false)}>
          <div className="modal max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-ink-100">
              <h3 className="text-sm font-bold text-blue-800 m-0">Filter OPD Queue by Date</h3>
              <button className="icon-btn" onClick={() => setShowCalendar(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-semibold text-ink-600 block mb-1.5">Select Specific Date</label>
                <input
                  type="date"
                  className="input"
                  value={calendarDate}
                  onChange={(e) => setCalendarDate(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  className="btn btn-primary h-[36px] text-xs flex-1"
                  onClick={() => setShowCalendar(false)}
                >
                  Apply Filter
                </button>
                <button
                  className="btn btn-secondary h-[36px] text-xs flex-1"
                  onClick={() => {
                    setCalendarDate('');
                    setShowCalendar(false);
                  }}
                >
                  Clear (Show All)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

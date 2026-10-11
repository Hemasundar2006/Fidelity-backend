import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar, Clock, CheckCircle2, UserPlus, RefreshCw,
  Globe, ExternalLink, AlertTriangle, ChevronRight, X,
  Phone, User, Filter, Search, Loader, Users,
  ClipboardList, LogIn, Link2, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchAppointments, updateAppointmentStatus } from '../services/api';
import ReportExchange from '../components/ReportExchange';

// ─── Small stat card ───────────────────────────────────────────────────────
const StatChip = ({ icon: Icon, label, value, color = 'blue' }) => {
  const c = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    pink: 'bg-pink-50 text-pink-600 border-pink-100',
  }[color] || 'bg-blue-50 text-blue-600 border-blue-100';

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-white shadow-sm`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{label}</p>
        <p className="text-xl font-bold text-ink-900 leading-tight">{value ?? '—'}</p>
      </div>
    </div>
  );
};

// ─── Status badge ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  if (status === 'Checked In' || status === 'checked_in') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
        <CheckCircle2 size={10} /> Checked In
      </span>
    );
  }
  if (status === 'Completed' || status === 'completed') {
    return (
      <span className="text-[11px] font-semibold text-ink-500 bg-ink-100 px-2 py-0.5 rounded-full">
        Completed
      </span>
    );
  }
  return (
    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
      Booked
    </span>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());

  const [dateFilter, setDateFilter] = useState('');       // '' = all
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [searchQ, setSearchQ] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [checkingIn, setCheckingIn] = useState(null);     // aptId being processed
  const [showReportExchange, setShowReportExchange] = useState(false);
  const [selectedPatientForExchange, setSelectedPatientForExchange] = useState(null);

  // ── Fetch live appointments ──────────────────────────────────────────────
  const loadQueue = async (isBackground = false) => {
    if (!isBackground) setSyncing(true);
    try {
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (doctorFilter !== 'All') params.doctor = doctorFilter;
      const data = await fetchAppointments(params);

      if (Array.isArray(data)) {
        setAppointments(data.map(apt => ({
          id: apt._id,
          token: apt.tokenNo || 1,
          time: apt.displayTime || new Date(apt.slotStart).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true
          }),
          date: new Date(apt.slotStart).toLocaleDateString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short'
          }),
          patientName: apt.patientDisplayName || apt.patientName || apt.patient?.name || 'Patient',
          patientPhone: apt.patientPhone || apt.patient?.phone || '',
          patientId: apt.patient?._id || null,
          doctor: apt.doctorDisplayName || apt.doctor?.name || 'Assigned Doctor',
          type: apt.type
            ? (apt.type.charAt(0).toUpperCase() + apt.type.slice(1))
            : 'Consultation',
          status: apt.status,
          source: apt.source || 'online',
          bookingRef: apt.bookingReference || apt._id?.slice(-8).toUpperCase(),
        })));
      }
      setLastSync(new Date());
    } catch (e) {
      console.warn('Queue load error:', e);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const timer = setInterval(() => loadQueue(true), 20000); // silent 20s poll
    return () => clearInterval(timer);
  }, [dateFilter, doctorFilter]);

  // ── Check In ────────────────────────────────────────────────────────────
  const handleCheckIn = async (aptId) => {
    setCheckingIn(aptId);
    // Optimistic update
    setAppointments(prev =>
      prev.map(a => a.id === aptId ? { ...a, status: 'checked_in' } : a)
    );
    try {
      await updateAppointmentStatus(aptId, 'checked_in');
    } catch (e) {
      console.warn('Check-in failed:', e);
      loadQueue(); // revert if error
    } finally {
      setCheckingIn(null);
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────
  const uniqueDoctors = ['All', ...new Set(appointments.map(a => a.doctor))];

  const filtered = appointments.filter(a => {
    if (doctorFilter !== 'All' && a.doctor !== doctorFilter) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      return (
        a.patientName?.toLowerCase().includes(q) ||
        a.patientPhone?.includes(searchQ) ||
        a.bookingRef?.toLowerCase().includes(q) ||
        a.doctor?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const checkedInCount = appointments.filter(a => a.status === 'checked_in' || a.status === 'Checked In').length;
  const pendingCount = appointments.filter(a => a.status !== 'checked_in' && a.status !== 'Checked In' && a.status !== 'completed').length;
  const onlineCount = appointments.filter(a => a.source === 'online').length;

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="pb-6 space-y-6 min-w-0">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading text-ink-900 m-0">OPD Receptionist Desk</h1>
          <p className="text-sm text-ink-500 mt-0.5">
            Welcome, <span className="font-semibold text-ink-700">{user?.name || 'Receptionist'}</span>
            &nbsp;·&nbsp;{today}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { setSelectedPatientForExchange(null); setShowReportExchange(true); }}
            className="btn bg-gradient-to-r from-teal-700 to-cyan-700 hover:from-teal-800 hover:to-cyan-800 text-white h-[36px] px-3.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs border-0"
          >
            <Link2 size={14} /> ABDM Report Exchange
          </button>
          <button
            onClick={() => loadQueue()}
            disabled={syncing}
            className="btn btn-secondary h-[36px] px-3 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Refresh'}
          </button>
          <Link
            to="/"
            target="_blank"
            className="btn btn-primary h-[36px] px-3 text-xs font-semibold flex items-center gap-1.5"
          >
            <Globe size={13} /> Patient Portal <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip icon={ClipboardList} label="Total Today" value={appointments.length} color="blue" />
        <StatChip icon={LogIn} label="Checked In" value={checkedInCount} color="green" />
        <StatChip icon={Clock} label="Pending" value={pendingCount} color="amber" />
        <StatChip icon={Globe} label="Online Bookings" value={onlineCount} color="pink" />
      </div>

      {/* ── Quick Actions ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { to: '/patients/register', icon: UserPlus, label: 'Register New Patient', color: 'blue' },
          { onClick: () => { setSelectedPatientForExchange(null); setShowReportExchange(true); }, icon: Link2, label: 'ABDM Exchange', color: 'teal' },
          { to: '/patients/search', icon: Users, label: 'Patient Directory', color: 'green' },
          { to: '/', target: '_blank', icon: Globe, label: 'Open Patient Website', color: 'pink' },
          { onClick: () => loadQueue(), icon: RefreshCw, label: 'Refresh Queue', color: 'amber' },
        ].map((a, i) =>
          a.onClick ? (
            <button
              key={i}
              onClick={a.onClick}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-ink-100 bg-white hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className={`w-9 h-9 rounded-lg bg-${a.color}-50 flex items-center justify-center`}>
                <a.icon size={18} className={`text-${a.color}-600`} />
              </div>
              <span className="text-[11px] font-semibold text-ink-700 text-center">{a.label}</span>
            </button>
          ) : (
            <Link
              key={i}
              to={a.to}
              target={a.target}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-ink-100 bg-white hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className={`w-9 h-9 rounded-lg bg-${a.color}-50 flex items-center justify-center`}>
                <a.icon size={18} className={`text-${a.color}-600`} />
              </div>
              <span className="text-[11px] font-semibold text-ink-700 text-center group-hover:text-blue-700">{a.label}</span>
            </Link>
          )
        )}
      </div>

      {/* ── OPD Queue Table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-ink-100 shadow-sm overflow-hidden">

        {/* Table Header */}
        <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-semibold text-ink-900 text-[15px] flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" />
              OPD Appointment Queue
              <span className="text-[11px] font-normal text-ink-400 ml-1">
                · auto-updates · last sync {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              {dateFilter ? `Filtered: ${dateFilter}` : 'All upcoming appointments'}
              {doctorFilter !== 'All' ? ` · Dr. ${doctorFilter}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search patient, ref…"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="pl-7 pr-2.5 h-[32px] text-xs rounded-lg border border-ink-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 w-44"
              />
            </div>

            {/* Doctor filter */}
            <select
              value={doctorFilter}
              onChange={e => setDoctorFilter(e.target.value)}
              className="h-[32px] text-xs rounded-lg border border-ink-200 px-2 focus:outline-none focus:border-blue-400 bg-white text-ink-700 cursor-pointer"
            >
              {uniqueDoctors.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Doctors' : d}</option>
              ))}
            </select>

            {/* Date filter */}
            <button
              onClick={() => setShowFilterModal(true)}
              className="h-[32px] px-3 text-xs rounded-lg border border-ink-200 flex items-center gap-1.5 text-ink-600 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer bg-white"
            >
              <Filter size={12} />
              {dateFilter ? dateFilter : 'Date'}
            </button>

            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="w-7 h-7 rounded-lg border border-ink-200 flex items-center justify-center text-ink-500 hover:text-red-500 hover:border-red-300 transition-colors cursor-pointer bg-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-ink-400 gap-2">
            <Loader size={22} className="animate-spin text-blue-500" />
            <span className="text-sm">Loading appointment queue…</span>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-ink-400 text-sm">
            <Calendar size={32} className="mx-auto mb-2 text-ink-300" />
            {searchQ
              ? `No appointments found matching "${searchQ}"`
              : 'No appointments in queue. Patients can book online from the Patient Portal.'}
          </div>
        )}

        {/* Desktop Table */}
        {!loading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 border-b border-ink-100">
                <tr>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500 w-16">Token</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500">Time</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500">Patient</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500">Phone</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500">Doctor</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500">Type</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500">Source</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map(apt => (
                  <tr
                    key={apt.id}
                    className={`group transition-colors ${
                      apt.status === 'checked_in' || apt.status === 'Checked In'
                        ? 'bg-green-50/50'
                        : 'hover:bg-blue-50/40'
                    }`}
                  >
                    {/* Token */}
                    <td className="px-5 py-3.5">
                      <span className="w-8 h-8 rounded-full bg-[#14179E] text-white text-[12px] font-bold flex items-center justify-center">
                        {apt.token}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-ink-900 text-[13px]">{apt.time}</p>
                      <p className="text-[11px] text-ink-400">{apt.date}</p>
                    </td>

                    {/* Patient */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 font-bold text-[12px] flex items-center justify-center shrink-0 cursor-pointer hover:ring-2 hover:ring-pink-400 transition-all"
                          onClick={() => apt.patientId && navigate(`/patients/${apt.patientId}`)}
                          title={apt.patientId ? 'View patient record' : ''}
                        >
                          {(apt.patientName || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p
                            className={`font-semibold text-ink-900 text-[13px] ${apt.patientId ? 'cursor-pointer hover:text-blue-600' : ''}`}
                            onClick={() => apt.patientId && navigate(`/patients/${apt.patientId}`)}
                          >
                            {apt.patientName}
                          </p>
                          <p className="text-[11px] text-ink-400 font-mono">{apt.bookingRef}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] text-ink-600 flex items-center gap-1">
                        {apt.patientPhone ? (
                          <a href={`tel:${apt.patientPhone}`} className="hover:text-blue-600 flex items-center gap-1">
                            <Phone size={11} className="text-ink-400" />
                            {apt.patientPhone}
                          </a>
                        ) : (
                          <span className="text-ink-300">—</span>
                        )}
                      </span>
                    </td>

                    {/* Doctor */}
                    <td className="px-4 py-3.5">
                      <p className="text-[13px] font-medium text-ink-700">{apt.doctor}</p>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] text-ink-600 bg-ink-100 px-2 py-0.5 rounded-full font-medium">
                        {apt.type}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3.5">
                      {apt.source === 'online' ? (
                        <span className="text-[11px] font-semibold text-pink-600 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full">Online</span>
                      ) : (
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">Walk-in</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={apt.status} />
                    </td>

                    {/* Check In Action */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedPatientForExchange({
                              _id: apt.patientId,
                              name: apt.patientName,
                              phone: apt.patientPhone,
                              motherId: apt.bookingRef
                            });
                            setShowReportExchange(true);
                          }}
                          className="h-[30px] px-2.5 text-[11px] font-semibold rounded-lg border border-teal-300 text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer flex items-center gap-1"
                          title="Open ABDM Report Exchange"
                        >
                          <Link2 size={11} /> ABDM
                        </button>
                        {apt.status !== 'checked_in' && apt.status !== 'Checked In' && apt.status !== 'completed' && (
                          <button
                            onClick={() => handleCheckIn(apt.id)}
                            disabled={checkingIn === apt.id}
                            className="h-[30px] px-3 text-[11px] font-semibold rounded-lg border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer flex items-center gap-1.5 ml-auto disabled:opacity-50"
                          >
                            {checkingIn === apt.id ? (
                              <Loader size={10} className="animate-spin" />
                            ) : (
                              <LogIn size={11} />
                            )}
                            Check In
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Cards */}
        {!loading && filtered.length > 0 && (
          <div className="md:hidden divide-y divide-ink-50">
            {filtered.map(apt => (
              <div key={apt.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#14179E] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                      {apt.token}
                    </div>
                    <div>
                      <p className="font-semibold text-ink-900">{apt.patientName}</p>
                      <p className="text-[11px] text-ink-400">{apt.time} · {apt.date}</p>
                    </div>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-ink-600">{apt.doctor} · {apt.type}</span>
                  {apt.source === 'online' && (
                    <span className="text-[10px] font-semibold text-pink-600 bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded-full">Online</span>
                  )}
                </div>
                {apt.patientPhone && (
                  <a href={`tel:${apt.patientPhone}`} className="text-[11px] text-blue-600 flex items-center gap-1">
                    <Phone size={10} /> {apt.patientPhone}
                  </a>
                )}
                {apt.status !== 'checked_in' && apt.status !== 'Checked In' && apt.status !== 'completed' && (
                  <button
                    onClick={() => handleCheckIn(apt.id)}
                    disabled={checkingIn === apt.id}
                    className="w-full h-[34px] text-[12px] font-semibold rounded-lg border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <LogIn size={13} /> Check In Patient
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-ink-100 bg-ink-50 flex items-center justify-between text-xs text-ink-400">
            <span>{filtered.length} appointment{filtered.length !== 1 ? 's' : ''} in queue</span>
            <span>{checkedInCount} checked in · {pendingCount} pending</span>
          </div>
        )}
      </div>

      {/* ── Date Filter Modal ───────────────────────────────────────────── */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowFilterModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-900">Filter by Date</h3>
              <button onClick={() => setShowFilterModal(false)} className="icon-btn">
                <X size={18} className="text-ink-600" />
              </button>
            </div>
            <input
              type="date"
              className="input mb-4"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                className="btn btn-primary flex-1 h-[40px] text-sm"
                onClick={() => setShowFilterModal(false)}
              >
                Apply
              </button>
              <button
                className="btn btn-secondary flex-1 h-[40px] text-sm"
                onClick={() => { setDateFilter(''); setShowFilterModal(false); }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Report Exchange Modal Mount ─────────────────────────────── */}
      <ReportExchange
        isOpen={showReportExchange}
        onClose={() => {
          setShowReportExchange(false);
          setSelectedPatientForExchange(null);
        }}
        patient={selectedPatientForExchange}
        onRecordImported={() => loadQueue(true)}
      />
    </div>
  );
};

export default ReceptionistDashboard;

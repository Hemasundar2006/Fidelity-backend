import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle, Clock, XCircle, Phone, Mail, RefreshCw, Activity, Calendar, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

const SuperAdminPanel = () => {
  const { authHeader } = useAuth();
  const [hospitalList, setHospitalList] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/hospitals`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) {
        setHospitalList(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const updateHospitalStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this hospital as ${status}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/hospitals/${id}/approve`, {
        method: 'PATCH',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        fetchHospitals();
      } else {
        alert(data.message || 'Error updating hospital status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredHospitals = activeFilter === 'all'
    ? hospitalList
    : hospitalList.filter(h => (h.status || 'pending') === activeFilter);

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-8 font-sans bg-[#f4fafe] min-h-screen rounded-[32px]">

      {/* Top Header matching target design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-[#e6f4fc]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f0f8fd] border border-[#76C0EC]/30 flex items-center justify-center text-[#76C0EC] shadow-sm">
            <ShieldCheck size={24} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Super Admin Platform</h1>
            <p className="text-sm text-gray-500 font-medium">Real-time hospital management and system telemetry across all sectors</p>
          </div>
        </div>

        <button
          onClick={fetchHospitals}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF95A5] hover:bg-[#ff8597] text-white text-sm font-bold rounded-xl shadow-md shadow-[#FF95A5]/30 transition-all active:scale-95"
        >
          <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Modern Filter Pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button onClick={() => setActiveFilter('all')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeFilter === 'all' ? 'bg-[#FF95A5] text-white shadow-md shadow-[#FF95A5]/30' : 'bg-white text-[#76C0EC] hover:bg-[#f0f8fd]'}`}>All Facilities</button>
        <button onClick={() => setActiveFilter('pending')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeFilter === 'pending' ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'bg-white text-[#76C0EC] hover:bg-amber-50'}`}>Pending Requests</button>
        <button onClick={() => setActiveFilter('approved')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeFilter === 'approved' ? 'bg-[#76C0EC] text-white shadow-md shadow-[#76C0EC]/30' : 'bg-white text-[#76C0EC] hover:bg-[#f0f8fd]'}`}>Active (Approved)</button>
        <button onClick={() => setActiveFilter('rejected')} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeFilter === 'rejected' ? 'bg-red-500 text-white shadow-md shadow-red-200' : 'bg-white text-[#76C0EC] hover:bg-red-50'}`}>Rejected</button>
      </div>

      {/* Grid of Hospital Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => {
          const status = hospital.status || 'pending';
          const regDate = hospital.createdAt ? new Date(hospital.createdAt).toLocaleDateString() : 'Unknown';
          const loginDate = hospital.adminRef?.lastLogin ? new Date(hospital.adminRef.lastLogin).toLocaleDateString() : 'N/A';
          const loginTime = hospital.adminRef?.lastLogin ? new Date(hospital.adminRef.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

          return (
            <div key={hospital._id} className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 flex flex-col hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-shadow">

              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="pr-4">
                  <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">{hospital.hospitalName}</h2>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-3">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">ID: {hospital._id.slice(-6).toUpperCase()}</span>
                  </div>

                  {/* Status Pill */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${status === 'approved' ? 'bg-[#f0f8fd] text-[#76C0EC]' :
                      status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-[#fff0f2] text-[#FF95A5]'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status === 'approved' ? 'bg-[#76C0EC]' :
                        status === 'rejected' ? 'bg-red-500' :
                          'bg-[#FF95A5]'
                      }`}></span>
                    {status}
                  </div>
                </div>

                {/* Top Action Button */}
                {status === 'pending' ? (
                  <button onClick={() => updateHospitalStatus(hospital._id, 'approved')} className="shrink-0 bg-[#f0f8fd] hover:bg-[#76C0EC] text-[#76C0EC] hover:text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border border-[#76C0EC]/20">
                    APPROVE
                  </button>
                ) : (
                  <button onClick={() => updateHospitalStatus(hospital._id, status === 'approved' ? 'rejected' : 'approved')} className="shrink-0 bg-[#fff0f2] hover:bg-[#FF95A5] text-[#FF95A5] hover:text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm border border-[#FF95A5]/20">
                    {status === 'approved' ? 'REVOKE' : 'RESTORE'}
                  </button>
                )}
              </div>

              <div className="w-full h-[1px] bg-gray-100 mb-4"></div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Telemetry & Contact</p>

              {/* Data Grid matching target */}
              <div className="grid grid-cols-2 gap-3 mb-6">

                {/* Registration Date */}
                <div className="bg-[#f7fcff] rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-[#76C0EC]/10">
                  <div className="w-8 h-8 rounded-full bg-[#f0f8fd] shadow-sm flex items-center justify-center text-[#76C0EC] mb-2">
                    <Calendar size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-[#76C0EC] tracking-wider uppercase mb-1">Registered</span>
                  <span className="text-sm font-bold text-gray-700">{regDate}</span>
                </div>

                {/* Last Active */}
                <div className="bg-[#fff7f8] rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-[#FF95A5]/10">
                  <div className="w-8 h-8 rounded-full bg-[#fff0f2] shadow-sm flex items-center justify-center text-[#FF95A5] mb-2">
                    <Activity size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-[#FF95A5] tracking-wider uppercase mb-1">Last Active</span>
                  <span className="text-sm font-bold text-gray-700">{loginDate}</span>
                  {loginTime && <span className="text-[10px] font-semibold text-[#FF95A5]">{loginTime}</span>}
                </div>

                {/* Email */}
                <div className="bg-[#f7fcff] rounded-2xl p-4 flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1 border border-[#76C0EC]/10">
                  <div className="w-8 h-8 rounded-full bg-[#f0f8fd] shadow-sm flex items-center justify-center text-[#76C0EC] mb-2">
                    <Mail size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-[#76C0EC] tracking-wider uppercase mb-1">Email Account</span>
                  <span className="text-[12px] font-bold text-gray-700 truncate w-full px-1">{hospital.email}</span>
                </div>

                {/* Mobile */}
                <div className="bg-[#fff7f8] rounded-2xl p-4 flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1 border border-[#FF95A5]/10">
                  <div className="w-8 h-8 rounded-full bg-[#fff0f2] shadow-sm flex items-center justify-center text-[#FF95A5] mb-2">
                    <Phone size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-[#FF95A5] tracking-wider uppercase mb-1">Contact No.</span>
                  <span className="text-sm font-bold text-gray-700">{hospital.mobile || 'N/A'}</span>
                </div>

              </div>

              {/* Bottom Status / Action */}
              <div className="mt-auto">
                {status === 'pending' ? (
                  <button onClick={() => updateHospitalStatus(hospital._id, 'rejected')} className="w-full py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm transition-colors flex items-center justify-center gap-2">
                    <XCircle size={16} />
                    Reject Application
                  </button>
                ) : (
                  <div className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${status === 'approved' ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-500'
                    }`}>
                    {status === 'approved' ? 'System Online (Approved)' : 'System Offline (Rejected)'}
                  </div>
                )}
              </div>

            </div>
          );
        })}

        {filteredHospitals.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 border-dashed">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-4">
              <Building2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Facilities Found</h3>
            <p className="text-gray-400 text-sm font-medium">There are no hospitals matching the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminPanel;

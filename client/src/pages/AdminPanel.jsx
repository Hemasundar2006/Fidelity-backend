import React, { useState, useEffect } from 'react';
import { Users, Database, ShieldAlert, CheckCircle, Plus, X, User as UserIcon, Mail, Briefcase, Activity, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

const AdminPanel = () => {
  const { user, authHeader } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'doctor', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/auth/users`, { headers: authHeader() });
      const data = await res.json();
      if (data.success) {
        setStaffList(data.data.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, status: u.isActive ? 'Active' : 'Inactive' })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
        setForm({ name: '', email: '', role: 'doctor', password: '' });
        setShowAddModal(false);
      } else {
        alert(data.message || 'Error creating user');
      }
    } catch (err) {
      alert(err.message || 'Error creating user');
    }
  };

  if (user && user.isApproved === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center font-sans">
        <div className="w-24 h-24 bg-[#fff0f2] rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#FF95A5]/20">
          <ShieldAlert size={48} className="text-[#FF95A5]" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Account Pending Approval</h2>
        <p className="text-[#76C0EC] text-lg max-w-md font-medium">
          Your hospital registration has been received. Please wait for the Super Admin to approve your account before you can manage staff.
        </p>
      </div>
    );
  }

  const filteredStaff = activeFilter === 'all' 
    ? staffList 
    : staffList.filter(s => s.role === activeFilter);

  const activeStaffCount = staffList.filter(s => s.status === 'Active').length;

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-8 font-sans bg-[#f4fafe] min-h-screen rounded-[32px]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 bg-white p-5 rounded-2xl border border-[#76C0EC]/20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f0f8fd] border border-[#76C0EC]/30 flex items-center justify-center text-[#76C0EC] shadow-sm">
            <ShieldCheck size={24} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Hospital Administration</h1>
            <p className="text-sm text-gray-500 font-medium">Manage hospital staff, roles, and telemetry access</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF95A5] hover:bg-[#ff8597] text-white text-sm font-bold rounded-xl shadow-md shadow-[#FF95A5]/30 transition-all active:scale-95"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add New Staff
        </button>
      </div>

      {/* Modern Filter Pills */}
      <div className="flex flex-wrap items-center gap-3 mb-8 bg-white p-2 rounded-2xl border border-[#76C0EC]/20 shadow-sm w-fit">
        <button onClick={() => setActiveFilter('all')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeFilter === 'all' ? 'bg-[#FF95A5] text-white shadow-md shadow-[#FF95A5]/30' : 'bg-transparent text-[#76C0EC] hover:bg-[#f0f8fd]'}`}>All Staff ({staffList.length})</button>
        <button onClick={() => setActiveFilter('doctor')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeFilter === 'doctor' ? 'bg-[#76C0EC] text-white shadow-md shadow-[#76C0EC]/30' : 'bg-transparent text-[#76C0EC] hover:bg-[#f0f8fd]'}`}>Doctors</button>
        <button onClick={() => setActiveFilter('nurse')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeFilter === 'nurse' ? 'bg-[#76C0EC] text-white shadow-md shadow-[#76C0EC]/30' : 'bg-transparent text-[#76C0EC] hover:bg-[#f0f8fd]'}`}>Nurses</button>
        <button onClick={() => setActiveFilter('receptionist')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeFilter === 'receptionist' ? 'bg-[#76C0EC] text-white shadow-md shadow-[#76C0EC]/30' : 'bg-transparent text-[#76C0EC] hover:bg-[#f0f8fd]'}`}>Receptionists</button>
        <button onClick={() => setActiveFilter('lab')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeFilter === 'lab' ? 'bg-[#76C0EC] text-white shadow-md shadow-[#76C0EC]/30' : 'bg-transparent text-[#76C0EC] hover:bg-[#f0f8fd]'}`}>Lab Technicians</button>
        <button onClick={() => setActiveFilter('pharmacy')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeFilter === 'pharmacy' ? 'bg-[#76C0EC] text-white shadow-md shadow-[#76C0EC]/30' : 'bg-transparent text-[#76C0EC] hover:bg-[#f0f8fd]'}`}>Pharmacy</button>
        <button onClick={() => setActiveFilter('admin')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeFilter === 'admin' ? 'bg-[#76C0EC] text-white shadow-md shadow-[#76C0EC]/30' : 'bg-transparent text-[#76C0EC] hover:bg-[#f0f8fd]'}`}>Admins</button>
      </div>

      {/* Premium Table Layout */}
      <div className="bg-white rounded-[24px] shadow-sm border border-[#76C0EC]/20 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f8fd] border-b border-[#76C0EC]/20">
                <th className="py-4 px-6 text-[12px] font-bold text-[#76C0EC] uppercase tracking-wider">Staff Member</th>
                <th className="py-4 px-6 text-[12px] font-bold text-[#76C0EC] uppercase tracking-wider">System Role</th>
                <th className="py-4 px-6 text-[12px] font-bold text-[#76C0EC] uppercase tracking-wider">Email Account</th>
                <th className="py-4 px-6 text-[12px] font-bold text-[#76C0EC] uppercase tracking-wider">Current State</th>
                <th className="py-4 px-6 text-[12px] font-bold text-[#76C0EC] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#76C0EC]/10">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-[#fff7f8] transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f0f8fd] text-[#76C0EC] flex items-center justify-center font-bold text-sm">
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-[15px]">{staff.name}</div>
                        <div className="text-xs font-semibold text-[#FF95A5] font-mono mt-0.5">ID: {staff.id.slice(-6).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#f7fcff] text-[#76C0EC] capitalize border border-[#76C0EC]/20">
                      <Briefcase size={14} />
                      {staff.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                      <Mail size={14} className="text-[#FF95A5]" />
                      {staff.email}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                      staff.status === 'Active' ? 'bg-[#f0f8fd] text-[#76C0EC]' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        staff.status === 'Active' ? 'bg-[#76C0EC]' : 'bg-gray-400'
                      }`}></span>
                      {staff.status}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-[12px] font-bold text-[#FF95A5] bg-[#fff0f2] hover:bg-[#FF95A5] hover:text-white px-4 py-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-[#FF95A5]/20 hover:border-transparent">
                      Edit Profile
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#f0f8fd] flex items-center justify-center text-[#76C0EC] mb-4">
                        <UserIcon size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">No Staff Found</h3>
                      <p className="text-[#FF95A5] text-sm font-medium">There are no staff members matching this role.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal (Redesigned to match) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-[480px] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">Add New Hospital Staff</h3>
              <button 
                type="button"
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors" 
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="p-6">
              <div className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Full Name & Title</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-gray-800" 
                    placeholder="e.g. Dr. Rajesh Kumar" 
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Hospital Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-gray-800" 
                    placeholder="e.g. rkumar@fidelity.com" 
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required 
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Temporary Password</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-gray-800" 
                    placeholder="Set password" 
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Clinical / System Role</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium text-gray-800 appearance-none" 
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="doctor">Doctor (Consultant / Specialist)</option>
                    <option value="nurse">Nurse (Staff Nurse / Midwife)</option>
                    <option value="admin">Administrator</option>
                    <option value="receptionist">Receptionist / Front Desk</option>
                    <option value="lab">Lab Technician</option>
                    <option value="pharmacy">Pharmacy</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8 mt-4">
                <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-[#76C0EC] hover:bg-[#f0f8fd] transition-colors" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#FF95A5] hover:bg-[#ff8597] text-white font-bold shadow-md shadow-[#FF95A5]/30 transition-colors">
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

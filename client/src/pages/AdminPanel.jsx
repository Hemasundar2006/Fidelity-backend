import React, { useState, useEffect } from 'react';
import { Users, Database, ShieldAlert, CheckCircle, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const AdminPanel = () => {
  const { authHeader } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'doctor', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/users', { headers: authHeader() });
      const data = await res.json();
      if (data.success) {
        setStaffList(data.data.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, status: u.isActive ? 'Active' : 'Inactive' })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/register', {
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

  return (
    <div className="max-w-6xl mx-auto pb-0 min-w-0">
      <div className="mb-6 max-sm:mb-4 flex flex-col gap-1">
        <h1 className="text-[28px] max-sm:text-[22px] leading-[36px] max-sm:leading-[30px] font-heading font-semibold text-blue-800 m-0">System Administration</h1>
        <p className="text-[18px] max-sm:text-[16px] leading-[26px] text-ink-600 m-0">Manage hospital staff, roles, and global configurations.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-sm:gap-4 mb-6">
        <div className="card flex flex-col justify-between min-h-[120px] max-sm:min-h-[104px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-600 leading-[20px] truncate">Active Staff</span>
            <div className="w-[40px] h-[40px] max-sm:w-[36px] max-sm:h-[36px] rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="text-[32px] max-sm:text-[28px] font-semibold font-heading text-blue-800 leading-[40px] max-sm:leading-[36px] tabular-nums">{staffList.length}</div>
          </div>
        </div>
        
        <div className="card flex flex-col justify-between min-h-[120px] max-sm:min-h-[104px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-600 leading-[20px] truncate">DB Uptime</span>
            <div className="w-[40px] h-[40px] max-sm:w-[36px] max-sm:h-[36px] rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <Database size={20} />
            </div>
          </div>
          <div>
            <div className="text-[32px] max-sm:text-[28px] font-semibold font-heading text-blue-800 leading-[40px] max-sm:leading-[36px] tabular-nums">99.9%</div>
          </div>
        </div>

        <div className="card flex flex-col justify-between min-h-[120px] max-sm:min-h-[104px] relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-red-600" />
          <div className="flex justify-between items-center mb-3">
            <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-600 leading-[20px] truncate">Security Breaches</span>
            <div className="w-[40px] h-[40px] max-sm:w-[36px] max-sm:h-[36px] rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <ShieldAlert size={20} />
            </div>
          </div>
          <div>
            <div className="text-[32px] max-sm:text-[28px] font-semibold font-heading text-red-700 leading-[40px] max-sm:leading-[36px] tabular-nums">0</div>
          </div>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden flex flex-col">
        <div className="flex justify-between items-start max-sm:flex-col gap-3 p-6 max-sm:p-4 pb-4 border-b border-ink-100">
          <h2 className="m-0 text-[16px] leading-[24px]">Staff Directory & Roles</h2>
          <button 
            className="btn btn-primary h-[36px] max-sm:h-[48px] max-sm:w-full max-sm:text-[16px]"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} /> Add New Staff
          </button>
        </div>
        
        {/* Desktop Table */}
        <div className="table-responsive hidden md:block">
          <table className="clinical-table admin-table">
            <thead>
              <tr>
                <th style={{ width: '30%', minWidth: '180px' }}>Staff Member</th>
                <th style={{ width: '35%', minWidth: '220px' }}>Email Address</th>
                <th style={{ width: '20%', minWidth: '130px' }}>Role</th>
                <th style={{ width: '15%', minWidth: '110px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr key={staff.id}>
                  <td className="font-semibold text-[15px]">{staff.name}</td>
                  <td className="text-ink-600">{staff.email}</td>
                  <td>
                    <span className="chip chip-ink">{staff.role}</span>
                  </td>
                  <td>
                    <span className="flex items-center gap-1.5 text-green-700 text-[14px] font-medium">
                      <CheckCircle size={16} className="text-green-600" /> {staff.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col gap-3 p-4 bg-ink-50">
          {staffList.map(staff => (
            <div key={staff.id} className="bg-white rounded-xl p-4 border border-ink-100 flex flex-col gap-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-blue-800 text-[16px] leading-[24px] truncate">{staff.name}</span>
                  <span className="text-[13px] text-ink-600 truncate">{staff.email}</span>
                </div>
                <span className="flex items-center gap-1.5 text-green-700 text-[12px] font-medium shrink-0 bg-green-50 px-2 py-1 rounded-md">
                  <CheckCircle size={14} className="text-green-600" /> {staff.status}
                </span>
              </div>
              <div className="flex items-center">
                <span className="chip chip-ink">{staff.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal card !p-0" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 max-sm:p-4 pb-4 border-b border-ink-100">
              <h3 className="m-0 text-[18px] leading-[26px] font-semibold text-blue-800">Add New Hospital Staff</h3>
              <button 
                type="button"
                className="icon-btn hover:text-red-600 hover:bg-red-50 -mr-2 -mt-2" 
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="p-6 max-sm:p-4 pt-4">
              <div className="mb-4 flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600 block">Full Name & Title</label>
                <input 
                  type="text" 
                  className="input max-sm:h-[48px] max-sm:text-[16px]" 
                  placeholder="e.g. Dr. Rajesh Kumar" 
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required 
                />
              </div>

              <div className="mb-4 flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600 block">Hospital Email</label>
                <input 
                  type="email" 
                  className="input max-sm:h-[48px] max-sm:text-[16px]" 
                  placeholder="e.g. rkumar@fidelity.com" 
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required 
                />
              </div>

              
              <div className="mb-4 flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600 block">Temporary Password</label>
                <input 
                  type="password" 
                  className="input max-sm:h-[48px] max-sm:text-[16px]" 
                  placeholder="Set password" 
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required 
                />
              </div>

              <div className="mb-6 flex flex-col gap-[6px]">
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600 block">Clinical / System Role</label>
                <select 
                  className="input max-sm:h-[48px] max-sm:text-[16px] bg-white" 
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

              <div className="flex justify-end gap-3 pt-4 border-t border-ink-100 max-sm:flex-col-reverse">
                <button type="button" className="btn btn-outline border-ink-200 h-[40px] max-sm:h-[48px] max-sm:text-[16px]" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary h-[40px] max-sm:h-[48px] max-sm:text-[16px]">
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

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, HeartPulse, Building2, Mail, Phone, Lock, Baby } from 'lucide-react';
import { API_BASE } from '../config';

const HospitalRegister = () => {
  const [form, setForm] = useState({ hospitalName: '', email: '', mobile: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hospitalName || !form.email || !form.mobile || !form.password || !form.confirmPassword) return;

    if (form.password !== form.confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch(`${API_BASE}/hospitals/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ text: 'Hospital registered successfully! Please wait for super admin approval.', type: 'success' });
        setForm({ hospitalName: '', email: '', mobile: '', password: '', confirmPassword: '' });
      } else {
        setMessage({ text: data.message || 'Error registering hospital', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Error registering hospital', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-100 flex items-center justify-center p-4 font-body">
      <div className="w-full max-w-xl bg-white rounded-card shadow-lg border border-ink-200 overflow-hidden flex flex-col p-8 md:p-12">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#14179E] text-white flex items-center justify-center">
            <Baby size={22} className="text-pink-400" />
          </div>
          <div>
            <span className="font-heading font-bold text-lg text-blue-800 block leading-tight">JanmaLink</span>
            <span className="text-[11px] uppercase tracking-wider text-ink-600">Fidelity Healthcare • Partner Portal</span>
          </div>
        </div>

        <h2 className="text-xl font-bold font-heading text-blue-800 mb-1">Hospital Registration</h2>
        <p className="text-xs text-ink-600 mb-6">
          Submit your institution's credentials to join our maternity care network.
        </p>

        {message.text && (
          <div className={`mb-6 p-3 rounded-lg border text-xs flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {message.type === 'success' ? <ShieldCheck size={15} className="shrink-0" /> : <HeartPulse size={15} className="shrink-0" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Hospital Name</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
              <input 
                type="text" 
                className="input pl-10" 
                placeholder="e.g. Apollo Cradle"
                value={form.hospitalName}
                onChange={e => setForm({ ...form, hospitalName: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Official Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
              <input 
                type="email" 
                className="input pl-10" 
                placeholder="e.g. admin@hospital.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Mobile Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
              <input 
                type="tel" 
                className="input pl-10" 
                placeholder="e.g. 9876543210"
                value={form.mobile}
                onChange={e => setForm({ ...form, mobile: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Admin Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                <input 
                  type="password" 
                  className="input pl-10" 
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                <input 
                  type="password" 
                  className="input pl-10" 
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full h-[46px] mt-2 flex items-center justify-center gap-2 cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Submitting Application...' : 'Submit Registration'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-ink-200 flex justify-between text-xs text-ink-400 items-center">
          <span>Already approved?</span>
          <Link to="/login" className="text-blue-600 font-bold hover:underline">Go to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default HospitalRegister;

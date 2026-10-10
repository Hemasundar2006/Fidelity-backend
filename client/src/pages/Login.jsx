import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Building, Lock, Mail, ShieldCheck, Baby, AlertCircle, Loader, Stethoscope, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_HOME } from '../components/ProtectedRoute';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      
      let dest = ROLE_HOME[user.role] || '/dashboard/receptionist';
      if (from && !from.startsWith('/dashboard') && from !== '/' && from !== '/login') {
        dest = from;
      }
      
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-ink-100 flex items-center justify-center p-4 font-body">
      <div className="w-full max-w-4xl bg-white rounded-card shadow-lg border border-ink-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Form */}
        <div className="flex-1 p-8 md:p-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              {/* Round icon with Doctor icon */}
              <div className="w-11 h-11 rounded-full bg-[#14179E] text-white flex items-center justify-center shadow-md border-2 border-blue-200/50 shrink-0">
                <Stethoscope size={22} className="text-pink-300" />
              </div>
              <div>
                <span className="font-heading font-bold text-lg text-blue-800 block leading-tight">JanmaLink</span>
                <span className="text-[11px] uppercase tracking-wider text-ink-600">Fidelity Healthcare • Secure Staff Login</span>
              </div>
            </div>

            {/* Quick Register button with round doctor icon */}
            <Link
              to="/hospital-register"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-all shadow-xs hover:shadow-sm cursor-pointer group self-start sm:self-center"
              title="Register as Partner Hospital or Doctor"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 group-hover:bg-blue-700 text-white flex items-center justify-center shadow-xs transition-colors">
                <Stethoscope size={13} />
              </div>
              <span>Register</span>
              <ChevronRight size={13} className="text-blue-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <h2 className="text-xl font-bold font-heading text-blue-800 mb-1">System Authentication</h2>
          <p className="text-xs text-ink-600 mb-6">
            Authorized hospital personnel only. All logins and data accesses are audited.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Institutional Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="e.g. kate@fid.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-ink-600 block mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full h-[46px] mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <><Loader size={16} className="animate-spin" /> Authenticating...</>
              ) : (
                'Authenticate Securely'
              )}
            </button>
          </form>

          {/* Prominent Doctor & Hospital Registration Banner */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0 border-2 border-white">
                <Stethoscope size={20} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">New Healthcare Partner or Doctor?</div>
                <div className="text-[11px] text-slate-500">Register your hospital, clinic or maternity department</div>
              </div>
            </div>
            <Link
              to="/hospital-register"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0 self-start sm:self-auto group"
            >
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                <Stethoscope size={10} />
              </div>
              <span>Register Now</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-ink-200 flex justify-between text-xs text-ink-400 items-center">
            <span>DPDP Act 2023 Compliant</span>
            <span>Version 4.2.1-prod</span>
          </div>
        </div>

        {/* Right Side: Info Panel */}
        <div className="w-full md:w-72 bg-[#14179E] text-white p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mb-6 border border-white/20">
              <Stethoscope size={26} className="text-pink-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3 font-heading">Role-Based Access</h3>
            <div className="space-y-2 text-xs text-white/80 leading-relaxed">
              <p>Each staff role sees a different dashboard tailored to their clinical workflow:</p>
              <ul className="space-y-1.5 mt-3">
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" /> Admin — System Management</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-300 shrink-0" /> Receptionist — OPD Queue</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 shrink-0" /> Doctor — Clinical Records</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-pink-400 shrink-0" /> Nurse — Vitals & Meds</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" /> Lab / Pharmacy — Reports</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-white/15 text-[11px] text-white/70 space-y-2">
            <div>Credential issues? Contact Fidelity IT Helpdesk: ext 4401.</div>
            <div>
              <Link to="/hospital-register" className="inline-flex items-center gap-1.5 text-pink-300 hover:text-white font-semibold transition-colors">
                <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                  <Stethoscope size={10} />
                </div>
                <span className="underline underline-offset-2">Hospital Registration Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, Settings, LogOut,
  Baby, Bell, Search, Menu, Globe, FlaskConical,
  Stethoscope, HeartPulse, Pill, ClipboardList, ShieldCheck,
  X, ChevronDown, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Nav items by role
const ROLE_NAV = {
  admin: [
    { path: '/dashboard/admin', label: 'Admin Overview', icon: LayoutDashboard },
    { path: '/admin', label: 'System Admin', icon: Settings },
    { path: '/patients/search', label: 'Patient Directory', icon: Users },
  ],
  receptionist: [
    { path: '/dashboard/receptionist', label: 'OPD Dashboard', icon: LayoutDashboard },
    { path: '/patients/search', label: 'Patient Directory', icon: Users },
    { path: '/patients/register', label: 'Register Patient', icon: UserPlus },
  ],
  doctor: [
    { path: '/dashboard/doctor', label: 'Clinical Dashboard', icon: Stethoscope },
    { path: '/patients/search', label: 'My Patients', icon: Users },
  ],
  nurse: [
    { path: '/dashboard/nurse', label: 'Ward Dashboard', icon: HeartPulse },
    { path: '/patients/search', label: 'Patient Directory', icon: Users },
  ],
  lab: [
    { path: '/dashboard/lab', label: 'Lab Queue', icon: FlaskConical },
    { path: '/patients/search', label: 'Patient Directory', icon: Users },
  ],
  pharmacy: [
    { path: '/dashboard/pharmacy', label: 'Pharmacy Queue', icon: Pill },
    { path: '/patients/search', label: 'Patient Directory', icon: Users },
  ],
};

const ROLE_META = {
  admin: { label: 'System Administrator', accent: 'bg-purple-500', iconBg: 'bg-purple-100 text-purple-700' },
  receptionist: { label: 'Receptionist', accent: 'bg-blue-500', iconBg: 'bg-blue-100 text-blue-700' },
  doctor: { label: 'Physician', accent: 'bg-green-500', iconBg: 'bg-green-100 text-green-700' },
  nurse: { label: 'Nursing Staff', accent: 'bg-pink-500', iconBg: 'bg-pink-100 text-pink-700' },
  lab: { label: 'Lab Technician', accent: 'bg-amber-500', iconBg: 'bg-amber-100 text-amber-700' },
  pharmacy: { label: 'Pharmacist', accent: 'bg-teal-500', iconBg: 'bg-teal-100 text-teal-700' },
};

const getInitials = (name = '') =>
  name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || '??';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = user?.role || 'receptionist';
  const navItems = ROLE_NAV[role] || ROLE_NAV.receptionist;
  const meta = ROLE_META[role] || ROLE_META.receptionist;

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/patients/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/patients/search');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-[100dvh] w-full overflow-hidden bg-ink-50 font-body text-ink-900 pt-[env(safe-area-inset-top)]">
      {/* Top Navigation */}
      <header className="relative h-[68px] max-md:h-[60px] bg-white flex items-center z-20 shrink-0 shadow-[0_4px_12px_rgba(30,34,230,0.06)] w-full px-8 max-sm:px-4">
        {/* Role accent bottom border */}
        <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${meta.accent}`} />

        <div className="max-w-[1280px] mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0 md:w-[224px]">
            <button className="md:hidden icon-btn -ml-2" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} className="text-ink-900" />
            </button>
            <div className="w-9 h-9 rounded-lg bg-[#14179E] flex items-center justify-center shrink-0 hidden md:flex">
              <Baby size={18} className="text-pink-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-[16px] text-blue-800 leading-tight tracking-tight">JanmaLink</span>
              <span className="text-[11px] uppercase text-ink-600 tracking-[0.08em] mt-0.5 hidden md:block">
                Fidelity Healthcare
              </span>
            </div>
          </div>

          {/* Global search – only for roles that can search patients */}
          {['admin', 'receptionist', 'doctor', 'nurse'].includes(role) && (
            <div className="flex-1 flex justify-center w-full">
              <form onSubmit={handleGlobalSearch} className="relative w-full max-w-xl mx-auto hidden md:block">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search patient by name, ID, or phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-[42px] bg-ink-50 text-ink-900 placeholder:text-ink-400 text-[14px] rounded-ctl pl-10 pr-3 border border-ink-200 focus:outline-none hover:border-blue-500 focus:bg-white focus:border-blue-600 focus:ring-[3px] focus:ring-blue-600/15 transition-all"
                />
              </form>
            </div>
          )}

          <div className="flex items-center gap-3 shrink-0 justify-end md:w-[300px]">
            <Link
              to="/"
              className="btn btn-secondary h-[34px] px-3 text-xs font-semibold flex items-center gap-1.5 shrink-0 hidden sm:inline-flex border-ink-200 text-ink-900 hover:bg-ink-100"
            >
              <Globe size={14} className="text-blue-600" /> Patient Site
            </Link>
            <button className="relative w-[40px] h-[40px] rounded-full text-ink-600 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center cursor-pointer border-0 bg-transparent shrink-0">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-[8px] h-[8px] rounded-full bg-pink-500 border-2 border-white" />
            </button>
            <div className="w-px h-8 bg-ink-200 hidden md:block" />
            <div className="flex items-center gap-3 md:pl-1 shrink-0">
              <div className="text-right hidden sm:block">
                <span className="block text-[14px] font-semibold text-ink-900 leading-tight">{user?.name || 'Staff'}</span>
                <span className="block text-[11px] text-ink-600 capitalize">{meta.label}</span>
              </div>
              <div className={`w-[40px] h-[40px] rounded-full text-white font-semibold text-[14px] flex items-center justify-center shadow-sm shrink-0 ${meta.accent}`}>
                {getInitials(user?.name)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex w-[248px] bg-white border-r border-ink-100 flex-col justify-between shrink-0 h-full py-4">
          {/* Role badge */}
          <div>
            <div className={`mx-4 mb-4 px-3 py-2 rounded-lg text-[12px] font-semibold uppercase tracking-wider ${meta.iconBg}`}>
              {meta.label}
            </div>
            <nav>
              <div className="px-6 pb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-400">Navigation</div>
              <div className="flex flex-col gap-1 px-3">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative flex items-center gap-3 px-[14px] h-[44px] rounded-ctl text-[14px] transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-ink-600 hover:bg-blue-50 hover:text-blue-600 font-medium'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-pink-500 rounded-r-full" />
                      )}
                      <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-ink-600'} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>

          <div className="pt-4 border-t border-ink-100 mx-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 h-[44px] rounded-ctl text-[14px] font-medium text-red-600 hover:bg-red-50 transition-colors mb-4 cursor-pointer border-0 bg-transparent"
            >
              <LogOut size={20} />
              <span>Secure Logout</span>
            </button>
            <div className="flex flex-col gap-1 px-3 text-[12px] text-ink-400">
              <span>© 2026 Fidelity Healthcare</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-ink-50 min-w-0">
          <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-8 py-5 sm:py-8 pb-[calc(20px+64px+env(safe-area-inset-bottom))] md:pb-12 min-w-0">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-[#14179E]/40 backdrop-blur-[2px]" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-[280px] max-w-[80vw] bg-white h-full flex flex-col justify-between p-4 z-10 shadow-pop">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold uppercase tracking-wider ${meta.iconBg}`}>
                  {meta.label}
                </span>
                <button onClick={() => setMobileMenuOpen(false)} className="icon-btn">
                  <X size={20} className="text-ink-600" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`relative flex items-center gap-3 px-[14px] h-[44px] rounded-ctl text-[14px] transition-colors ${
                        isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-ink-600 hover:bg-blue-50 hover:text-blue-600 font-medium'
                      }`}
                    >
                      {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-pink-500 rounded-r-full" />}
                      <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-ink-600'} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-ink-100">
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-3 px-3 h-[44px] rounded-ctl text-[14px] font-medium text-red-600 hover:bg-red-50 transition-colors mb-4 cursor-pointer border-0 bg-transparent"
              >
                <LogOut size={20} />
                <span>Secure Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-ink-100 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] z-40">
        {navItems.slice(0, 4).map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
                isActive ? 'text-blue-600' : 'text-ink-400 hover:text-ink-600'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-blue-600' : ''} />
              <span className="text-[10px] font-medium leading-none">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;

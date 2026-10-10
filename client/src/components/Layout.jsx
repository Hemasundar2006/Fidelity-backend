import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, Settings, LogOut,
  Baby, Bell, Search, Menu, Globe, FlaskConical, Activity,
  Stethoscope, HeartPulse, Pill, ShieldCheck,
  X, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Brand Colors
const BLUE = '#76C0EC';
const BLUE_DARK = '#0284c7'; // Higher contrast for text/icons
const BLUE_LIGHT = '#f0f8fd';
const PINK = '#FF95A5';
const PINK_DARK = '#e11d48'; // Higher contrast for text/icons
const PINK_LIGHT = '#fff0f2';

// Nav items by role
const ROLE_NAV = {
  superadmin: [
    { path: '/super-admin', label: 'Platform Admin', icon: Settings },
  ],
  admin: [
    { path: '/dashboard/admin', label: 'Admin Overview', icon: LayoutDashboard },
    { path: '/admin', label: 'System Admin', icon: Settings },
    { path: '/patients/search', label: 'Patient Directory', icon: Users },
    { path: '/patients/register', label: 'Register Mother', icon: UserPlus },
    { path: '/babies/search', label: 'Baby Directory', icon: Baby },
    { path: '/babies/register', label: 'Register Baby', icon: Baby },
    { path: '/fetus-monitor', label: 'Fetal Monitor', icon: Activity },
    { path: '/maternal-health-predictor', label: 'Risk Predictor', icon: HeartPulse },
  ],
  receptionist: [
    { path: '/dashboard/receptionist', label: 'OPD Dashboard', icon: LayoutDashboard },
    { path: '/patients/search', label: 'Patient Directory', icon: Users },
    { path: '/babies/search', label: 'Baby Directory', icon: Baby },
    { path: '/patients/register', label: 'Register Mother', icon: UserPlus },
    { path: '/babies/register', label: 'Register Baby', icon: Baby },
  ],
  doctor: [
    { path: '/dashboard/doctor', label: 'Clinical Dashboard', icon: Stethoscope },
    { path: '/patients/search', label: 'My Patients', icon: Users },
    { path: '/babies/search', label: 'Baby Directory', icon: Baby },
    { path: '/maternal-health-predictor', label: 'Risk Predictor', icon: HeartPulse },
  ],
  nurse: [
    { path: '/dashboard/nurse', label: 'Ward Dashboard', icon: HeartPulse },
    { path: '/patients/search', label: 'Patient Directory', icon: Users },
    { path: '/babies/search', label: 'Baby Directory', icon: Baby },
    { path: '/babies/register', label: 'Register Baby', icon: Baby },
    { path: '/maternal-health-predictor', label: 'Risk Predictor', icon: HeartPulse },
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
  superadmin: { label: 'Platform Administrator', theme: 'pink' },
  admin: { label: 'System Administrator', theme: 'blue' },
  receptionist: { label: 'Receptionist', theme: 'blue' },
  doctor: { label: 'Physician', theme: 'blue' },
  nurse: { label: 'Nursing Staff', theme: 'pink' },
  lab: { label: 'Lab Technician', theme: 'blue' },
  pharmacy: { label: 'Pharmacist', theme: 'blue' },
};

const getInitials = (name = '') =>
  name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || '??';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('jl_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem('jl_sidebar_open', String(next));
      return next;
    });
  };

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
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-body text-slate-800">
      {/* ── Sidebar (Desktop) ── */}
      <aside
        className={`hidden md:flex flex-col shrink-0 h-full bg-white border-r border-slate-200 transition-[width] duration-300 ease-in-out z-30 ${
          isSidebarOpen ? 'w-[260px]' : 'w-[80px]'
        }`}
      >
        <div className="flex items-center justify-between h-[64px] px-4 border-b border-slate-200 shrink-0">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: BLUE_LIGHT }}>
                <Baby size={20} style={{ color: BLUE_DARK }} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-heading font-extrabold text-[18px] leading-tight tracking-tight truncate" style={{ color: BLUE_DARK }}>
                  JanmaLink
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center shrink-0 shadow-sm hover:scale-105 transition-all cursor-pointer"
              style={{ backgroundColor: BLUE_LIGHT }}
            >
              <Baby size={22} style={{ color: BLUE_DARK }} />
            </button>
          )}

          {isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            >
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>

        {/* Role Badge */}
        {isSidebarOpen ? (
          <div className="px-5 py-4 shrink-0 transition-opacity duration-300">
            <div className="px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider text-center flex items-center justify-center border" style={{ backgroundColor: meta.theme === 'pink' ? PINK_LIGHT : BLUE_LIGHT, color: meta.theme === 'pink' ? PINK_DARK : BLUE_DARK, borderColor: meta.theme === 'pink' ? '#FF95A540' : '#76C0EC40' }}>
              {meta.label}
            </div>
          </div>
        ) : (
          <div className="mt-4 flex justify-center shrink-0 transition-opacity duration-300">
             <div className="w-10 h-10 rounded-lg text-[13px] font-bold flex items-center justify-center border" style={{ backgroundColor: meta.theme === 'pink' ? PINK_LIGHT : BLUE_LIGHT, color: meta.theme === 'pink' ? PINK_DARK : BLUE_DARK, borderColor: meta.theme === 'pink' ? '#FF95A540' : '#76C0EC40' }}>
                {role.charAt(0).toUpperCase()}
             </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-2">
          {isSidebarOpen && (
            <div className="px-6 pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap overflow-hidden transition-opacity duration-300">
              Menu
            </div>
          )}
          <div className="flex flex-col">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

              if (isSidebarOpen) {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-6 h-[44px] text-[14px] transition-all duration-200 border-l-4 overflow-hidden whitespace-nowrap ${
                      isActive
                        ? 'font-bold bg-slate-50'
                        : 'text-slate-700 hover:bg-slate-50 border-transparent font-medium'
                    }`}
                    style={{ borderLeftColor: isActive ? BLUE_DARK : 'transparent', color: isActive ? BLUE_DARK : undefined }}
                  >
                    <item.icon
                      size={20}
                      className="shrink-0 transition-colors"
                      style={{ color: isActive ? BLUE_DARK : '#64748b' }}
                    />
                    <span className="truncate opacity-100 transition-opacity duration-300 delay-100">{item.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={`flex items-center justify-center w-[44px] h-[44px] mx-auto rounded-xl transition-all duration-200 mb-1 ${
                    isActive
                      ? 'shadow-sm'
                      : 'hover:bg-slate-100'
                  }`}
                  style={{ backgroundColor: isActive ? BLUE_LIGHT : 'transparent' }}
                >
                  <item.icon size={20} style={{ color: isActive ? BLUE_DARK : '#64748b' }} className="transition-colors" />
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Action: Logout */}
        <div className="p-4 border-t border-slate-200 shrink-0">
          {isSidebarOpen ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 h-[40px] rounded-lg text-[13px] font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all cursor-pointer"
            >
              <LogOut size={16} className="shrink-0" />
              <span className="whitespace-nowrap">Logout</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              title="Logout"
              className="w-[40px] h-[40px] mx-auto flex items-center justify-center rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main Layout (Header + Page Content) ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
          
          <div className="flex items-center gap-3">
            <button
              className="md:hidden icon-btn -ml-2 text-slate-600 p-2 rounded-xl hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <Baby size={20} style={{ color: BLUE_DARK }} />
              <span className="font-heading font-bold text-[16px]" style={{ color: BLUE_DARK }}>JanmaLink</span>
            </div>

            {/* Desktop: Hospital indicator badge */}
            <div className="hidden md:flex items-center gap-2">
              {!isSidebarOpen && (
                <button
                  onClick={toggleSidebar}
                  className="w-8 h-8 mr-2 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                >
                  <PanelLeftOpen size={18} />
                </button>
              )}
              <div className="px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-2 shadow-sm">
                <ShieldCheck size={14} style={{ color: PINK_DARK }} />
                <span>{user?.hospital?.name || user?.hospitalRef?.name || 'JanmaLink Health'}</span>
              </div>
            </div>
          </div>

          {/* Center: Search */}
          {['admin', 'receptionist', 'doctor', 'nurse'].includes(role) && (
            <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <form onSubmit={handleGlobalSearch} className="relative w-full">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search patient by name, ID, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[40px] bg-slate-50 text-slate-800 placeholder:text-slate-400 text-[13px] rounded-lg pl-10 pr-4 border border-slate-200 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </form>
            </div>
          )}

          {/* Right: Actions and User Profile */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/"
              className="hidden sm:flex h-[36px] px-3.5 rounded-lg text-xs font-medium items-center gap-2 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm"
            >
              <Globe size={14} style={{ color: PINK_DARK }} />
              <span>Patient Site</span>
            </Link>
            <button
              title="Notifications"
              className="relative w-[36px] h-[36px] rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-[8px] h-[8px] rounded-full border-2 border-white" style={{ backgroundColor: PINK }} />
            </button>
            <div className="w-px h-6 bg-slate-200 hidden md:block" />
            <div className="flex items-center gap-3 shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <span className="block text-[13px] font-bold text-slate-800 leading-tight">
                  {user?.name || 'Staff'}
                </span>
                <span className="block text-[11px] text-slate-500 font-medium capitalize mt-0.5">
                  {meta.label}
                </span>
              </div>
              <div
                className="w-[36px] h-[36px] rounded-lg text-white font-bold text-[13px] flex items-center justify-center shadow-sm shrink-0"
                style={{ backgroundColor: meta.theme === 'pink' ? PINK_DARK : BLUE_DARK }}
              >
                {getInitials(user?.name)}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 min-w-0 bg-slate-50">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-[280px] max-w-[80vw] bg-white h-full flex flex-col justify-between z-10 shadow-xl">
            <div>
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <span className="px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider" style={{ backgroundColor: meta.theme === 'pink' ? PINK_LIGHT : BLUE_LIGHT, color: meta.theme === 'pink' ? PINK_DARK : BLUE_DARK }}>
                  {meta.label}
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:bg-slate-100 rounded-lg p-2 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col py-2">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-6 h-[48px] text-[14px] transition-all border-l-4 ${
                        isActive
                          ? 'font-bold bg-slate-50'
                          : 'text-slate-700 hover:bg-slate-50 border-transparent font-medium'
                      }`}
                      style={{ borderLeftColor: isActive ? BLUE_DARK : 'transparent', color: isActive ? BLUE_DARK : undefined }}
                    >
                      <item.icon
                        size={20}
                        className="shrink-0"
                        style={{ color: isActive ? BLUE_DARK : '#64748b' }}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 h-[44px] rounded-lg text-[14px] font-bold text-slate-600 hover:text-red-600 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-all"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-slate-200 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] z-40 shadow-lg">
        {navItems.slice(0, 4).map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <item.icon size={22} style={{ color: isActive ? BLUE_DARK : '#64748b' }} className="transition-colors" />
              <span className="text-[10px] font-semibold leading-none text-slate-700">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;

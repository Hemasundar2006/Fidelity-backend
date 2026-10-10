import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, Settings, LogOut,
  Baby, Bell, Search, Menu, Globe, FlaskConical, Activity,
  Stethoscope, HeartPulse, Pill, ClipboardList, ShieldCheck,
  X, ChevronDown, Layers, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Nav items by role
const ROLE_NAV = {
  superadmin: [
    { path: '/super-admin', label: 'Platform Admin', icon: Settings },
  ],
  admin: [
    { path: '/dashboard/admin', label: 'Admin Overview', icon: LayoutDashboard },
    { path: '/admin', label: 'System Admin', icon: Settings },
    { path: '/patients/search', label: 'Patient Directory', icon: Users },
    { path: '/fetus-monitor', label: 'AI Diagnostics', icon: Activity },
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
  superadmin: { label: 'Platform Administrator', accent: 'bg-[#FF95A5]', iconBg: 'bg-[#fff0f2] text-[#FF95A5]' },
  admin: { label: 'System Administrator', accent: 'bg-[#FF95A5]', iconBg: 'bg-[#fff0f2] text-[#FF95A5]' },
  receptionist: { label: 'Receptionist', accent: 'bg-[#76C0EC]', iconBg: 'bg-[#f0f8fd] text-[#76C0EC]' },
  doctor: { label: 'Physician', accent: 'bg-[#FF95A5]', iconBg: 'bg-[#fff0f2] text-[#FF95A5]' },
  nurse: { label: 'Nursing Staff', accent: 'bg-[#FF95A5]', iconBg: 'bg-[#fff0f2] text-[#FF95A5]' },
  lab: { label: 'Lab Technician', accent: 'bg-[#76C0EC]', iconBg: 'bg-[#f0f8fd] text-[#76C0EC]' },
  pharmacy: { label: 'Pharmacist', accent: 'bg-[#76C0EC]', iconBg: 'bg-[#f0f8fd] text-[#76C0EC]' },
};

const getInitials = (name = '') =>
  name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || '??';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Persistent sidebar state
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
    <div className="flex h-screen w-full overflow-hidden bg-white font-body text-gray-800">
      {/* ── Sidebar (Desktop) ── */}
      <aside
        className={`hidden md:flex flex-col shrink-0 h-full py-3 pl-4 pr-1 transition-[width] duration-300 ease-in-out z-30 ${
          isSidebarOpen ? 'w-[260px]' : 'w-[82px]'
        }`}
      >
        <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-[#76C0EC]/20 overflow-hidden">
          {/* Sidebar Top: Logo + Open/Close Button */}
          {isSidebarOpen ? (
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#76C0EC]/15 shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-2xl bg-[#fff0f2] border border-[#FF95A5]/25 flex items-center justify-center shrink-0 shadow-sm">
                  <Baby size={22} className="text-[#FF95A5]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-heading font-bold text-[18px] text-[#FF95A5] leading-tight tracking-tight truncate">
                    JanmaLink
                  </span>
                  <span className="text-[9px] uppercase font-bold text-[#76C0EC] tracking-widest mt-0.5 truncate">
                    Fidelity Healthcare
                  </span>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                title="Collapse sidebar"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#76C0EC] hover:text-[#FF95A5] hover:bg-[#fff0f2] transition-colors shrink-0 cursor-pointer border border-[#76C0EC]/20 hover:border-[#FF95A5]/30"
              >
                <PanelLeftClose size={18} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-3.5 border-b border-[#76C0EC]/15 shrink-0">
              <button
                onClick={toggleSidebar}
                title="JanmaLink - Click to expand"
                className="w-10 h-10 rounded-2xl bg-[#fff0f2] border border-[#FF95A5]/25 flex items-center justify-center shrink-0 shadow-sm hover:scale-105 transition-all cursor-pointer"
              >
                <Baby size={22} className="text-[#FF95A5]" />
              </button>
              <button
                onClick={toggleSidebar}
                title="Open sidebar"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#76C0EC] hover:text-[#FF95A5] hover:bg-[#fff0f2] transition-colors shrink-0 cursor-pointer border border-[#76C0EC]/20 hover:border-[#FF95A5]/30"
              >
                <PanelLeftOpen size={18} />
              </button>
            </div>
          )}

          {/* Role Badge */}
          {isSidebarOpen ? (
            <div className={`mx-3 mt-3 mb-2 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-center flex items-center justify-center shrink-0 ${meta.iconBg}`}>
              {meta.label}
            </div>
          ) : (
            <div
              className={`mx-auto mt-3 mb-2 w-9 h-9 rounded-xl text-[13px] font-bold flex items-center justify-center shadow-sm shrink-0 ${meta.iconBg}`}
              title={meta.label}
            >
              {role.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Navigation Links */}
          <nav className="mt-2 flex-1 overflow-y-auto px-3">
            {isSidebarOpen && (
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#76C0EC]/80">
                Navigation
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                if (isSidebarOpen) {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3.5 h-[46px] rounded-2xl text-[13px] transition-all duration-200 ${
                        isActive
                          ? 'bg-[#FF95A5] text-white font-bold shadow-md shadow-[#FF95A5]/30'
                          : 'text-[#76C0EC] hover:bg-[#f0f8fd] hover:text-[#FF95A5] font-semibold'
                      }`}
                    >
                      <item.icon
                        size={20}
                        className={isActive ? 'text-white shrink-0' : 'text-[#76C0EC] shrink-0'}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={item.label}
                    className={`flex items-center justify-center w-[46px] h-[46px] mx-auto rounded-2xl text-[13px] transition-all duration-200 ${
                      isActive
                        ? 'bg-[#FF95A5] text-white font-bold shadow-md shadow-[#FF95A5]/30'
                        : 'text-[#76C0EC] hover:bg-[#f0f8fd] hover:text-[#FF95A5]'
                    }`}
                  >
                    <item.icon size={20} className={isActive ? 'text-white' : 'text-[#76C0EC]'} />
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Action: Logout */}
          <div className="p-3 mt-auto border-t border-[#76C0EC]/15 shrink-0">
            {isSidebarOpen ? (
              <>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 h-[42px] rounded-xl text-[13px] font-bold text-[#FF95A5] bg-[#fff0f2] hover:bg-[#FF95A5] hover:text-white transition-all mb-2 cursor-pointer shadow-sm border border-[#FF95A5]/25 hover:border-transparent"
                >
                  <LogOut size={17} strokeWidth={2.5} className="shrink-0" />
                  <span className="whitespace-nowrap">Secure Logout</span>
                </button>
                <div className="text-center text-[10px] font-semibold text-[#76C0EC]/70">
                  © 2026 Fidelity
                </div>
              </>
            ) : (
              <button
                onClick={handleLogout}
                title="Secure Logout"
                className="w-[44px] h-[44px] mx-auto flex items-center justify-center rounded-xl text-[#FF95A5] bg-[#fff0f2] hover:bg-[#FF95A5] hover:text-white transition-all cursor-pointer shadow-sm border border-[#FF95A5]/25 hover:border-transparent"
              >
                <LogOut size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Layout (Header + Page Content) ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Transparent Shorter Top Header */}
        <header className="h-[56px] max-md:h-[52px] bg-transparent flex items-center justify-between px-6 max-sm:px-4 shrink-0 z-20">
          {/* Left: Mobile hamburger & branding OR Desktop hospital badge */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden icon-btn -ml-1 text-[#76C0EC] p-2 rounded-xl hover:bg-[#f0f8fd]"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <Baby size={20} className="text-[#FF95A5]" />
              <span className="font-heading font-bold text-[16px] text-[#FF95A5]">JanmaLink</span>
            </div>

            {/* Desktop: Hospital indicator badge */}
            <div className="hidden md:flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#76C0EC]/20 shadow-sm text-gray-700 flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#FF95A5]" />
                <span className="font-bold text-[#76C0EC]">
                  {user?.hospital?.name || user?.hospitalRef?.name || 'JanmaLink Health'}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Search (for authorized staff roles) */}
          {['admin', 'receptionist', 'doctor', 'nurse'].includes(role) && (
            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <form onSubmit={handleGlobalSearch} className="relative w-full">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76C0EC] pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search patient by name, ID, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[38px] bg-white text-gray-800 placeholder:text-gray-400 text-[13px] rounded-full pl-10 pr-4 border border-[#76C0EC]/30 shadow-sm focus:outline-none hover:border-[#FF95A5] focus:border-[#FF95A5] focus:ring-2 focus:ring-[#FF95A5]/20 transition-all"
                />
              </form>
            </div>
          )}

          {/* Right: Actions and User Profile */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/"
              className="h-[36px] px-3.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 hidden sm:inline-flex bg-white text-[#76C0EC] hover:text-[#FF95A5] hover:bg-[#f0f8fd] border border-[#76C0EC]/20 shadow-sm transition-colors"
            >
              <Globe size={14} className="text-[#FF95A5]" />
              <span>Patient Site</span>
            </Link>
            <button
              title="Notifications"
              className="relative w-[36px] h-[36px] rounded-full bg-white border border-[#76C0EC]/20 text-[#76C0EC] hover:text-[#FF95A5] hover:bg-[#fff0f2] shadow-sm flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-[7px] h-[7px] rounded-full bg-[#FF95A5] border-2 border-white" />
            </button>
            <div className="w-px h-6 bg-[#76C0EC]/20 hidden md:block" />
            <div className="flex items-center gap-2.5 shrink-0 bg-white border border-[#76C0EC]/20 rounded-full px-2 py-1 shadow-sm">
              <div className="text-right hidden sm:block pl-1">
                <span className="block text-[13px] font-bold text-gray-800 leading-tight">
                  {user?.name || 'Staff'}
                </span>
                <span className="block text-[10px] text-[#76C0EC] font-semibold capitalize leading-none mt-0.5">
                  {meta.label}
                </span>
              </div>
              <div
                className={`w-[34px] h-[34px] rounded-full text-white font-bold text-[12px] flex items-center justify-center shadow-sm shrink-0 ${meta.accent}`}
              >
                {getInitials(user?.name)}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-6 max-sm:px-4 pb-6 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#76C0EC]/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-[280px] max-w-[80vw] bg-white h-full flex flex-col justify-between p-6 z-10 shadow-xl rounded-r-3xl border-r border-[#76C0EC]/20">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className={`px-4 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wider ${meta.iconBg}`}>
                  {meta.label}
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="icon-btn hover:bg-[#f0f8fd] text-[#76C0EC] rounded-full p-2 transition-colors border-0 bg-transparent"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`relative flex items-center gap-3 px-[16px] h-[48px] rounded-2xl text-[14px] transition-all duration-200 group ${
                        isActive
                          ? 'bg-[#FF95A5] text-white font-bold shadow-md shadow-[#FF95A5]/30'
                          : 'text-[#76C0EC] hover:bg-[#f0f8fd] font-semibold'
                      }`}
                    >
                      <item.icon
                        size={20}
                        className={isActive ? 'text-white' : 'text-[#76C0EC] group-hover:text-[#FF95A5] transition-colors'}
                      />
                      <span className={isActive ? '' : 'group-hover:text-[#FF95A5] transition-colors'}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#76C0EC]/10">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 h-[48px] rounded-xl text-[14px] font-bold text-[#FF95A5] bg-[#fff0f2] hover:bg-[#FF95A5] hover:text-white transition-all mb-4 cursor-pointer shadow-sm border border-[#FF95A5]/20 hover:border-transparent"
              >
                <LogOut size={18} strokeWidth={2.5} />
                <span>Secure Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-[#76C0EC]/10 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] z-40 rounded-t-3xl shadow-[0_-4px_24px_rgba(118,192,236,0.1)]">
        {navItems.slice(0, 4).map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-[#FF95A5]' : 'text-[#76C0EC] hover:text-[#FF95A5]'
              }`}
            >
              <item.icon size={22} className={isActive ? 'text-[#FF95A5]' : ''} />
              <span className="text-[10px] font-bold leading-none">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;

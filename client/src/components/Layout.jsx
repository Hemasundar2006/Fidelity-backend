import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, Settings, LogOut,
  Baby, Bell, Search, Menu, Globe, FlaskConical, Activity,
  Stethoscope, HeartPulse, Pill, ShieldCheck,
  X, PanelLeftClose, PanelLeftOpen, Terminal, Package, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

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
    { path: '/super-admin', label: 'Platform Overview', transKey: 'platformOverview', icon: LayoutDashboard },
    { path: '/super-admin/hospitals', label: 'Partner Hospitals', transKey: 'partnerHospitals', icon: Building2 },
    { path: '/super-admin/offerings', label: 'Platform Offerings', transKey: 'platformOfferings', icon: Package },
    { path: '/super-admin/logs', label: 'System Logs', transKey: 'systemLogs', icon: Terminal },
  ],
  admin: [
    { path: '/dashboard/admin', label: 'Admin Overview', transKey: 'adminOverview', icon: LayoutDashboard },
    { path: '/admin', label: 'System Admin', transKey: 'systemAdmin', icon: Settings },
    { path: '/patients/search', label: 'Patient Directory', transKey: 'patientDirectory', icon: Users },
    { path: '/patients/register', label: 'Register Mother', transKey: 'registerMother', icon: UserPlus },
    { path: '/babies/search', label: 'Baby Directory', transKey: 'babyDirectory', icon: Baby },
    { path: '/babies/register', label: 'Register Baby', transKey: 'registerBaby', icon: Baby },
    { path: '/fetus-monitor', label: 'Fetal Monitor', transKey: 'fetalMonitor', icon: Activity },
    { path: '/maternal-health-predictor', label: 'Risk Predictor', transKey: 'riskPredictor', icon: HeartPulse },
  ],
  receptionist: [
    { path: '/dashboard/receptionist', label: 'OPD Dashboard', transKey: 'opdDashboard', icon: LayoutDashboard },
    { path: '/patients/search', label: 'Patient Directory', transKey: 'patientDirectory', icon: Users },
    { path: '/babies/search', label: 'Baby Directory', transKey: 'babyDirectory', icon: Baby },
    { path: '/patients/register', label: 'Register Mother', transKey: 'registerMother', icon: UserPlus },
    { path: '/babies/register', label: 'Register Baby', transKey: 'registerBaby', icon: Baby },
  ],
  doctor: [
    { path: '/dashboard/doctor', label: 'Clinical Dashboard', transKey: 'clinicalDashboard', icon: Stethoscope },
    { path: '/patients/search', label: 'Patient Directory', transKey: 'patientDirectory', icon: Users },
    { path: '/babies/search', label: 'Baby Directory', transKey: 'babyDirectory', icon: Baby },
    { path: '/fetus-monitor', label: 'Fetal Monitor', transKey: 'fetalMonitor', icon: Activity },
    { path: '/maternal-health-predictor', label: 'Risk Predictor', transKey: 'riskPredictor', icon: HeartPulse },
  ],
  nurse: [
    { path: '/dashboard/nurse', label: 'Ward Dashboard', transKey: 'wardDashboard', icon: HeartPulse },
    { path: '/patients/search', label: 'Patient Directory', transKey: 'patientDirectory', icon: Users },
    { path: '/babies/search', label: 'Baby Directory', transKey: 'babyDirectory', icon: Baby },
    { path: '/babies/register', label: 'Register Baby', transKey: 'registerBaby', icon: Baby },
    { path: '/fetus-monitor', label: 'Fetal Monitor', transKey: 'fetalMonitor', icon: Activity },
    { path: '/maternal-health-predictor', label: 'Risk Predictor', transKey: 'riskPredictor', icon: HeartPulse },
  ],
  lab: [
    { path: '/dashboard/lab', label: 'Lab Queue', transKey: 'labQueue', icon: FlaskConical },
    { path: '/patients/search', label: 'Patient Directory', transKey: 'patientDirectory', icon: Users },
  ],
  pharmacy: [
    { path: '/dashboard/pharmacy', label: 'Pharmacy Queue', transKey: 'pharmacyQueue', icon: Pill },
    { path: '/patients/search', label: 'Patient Directory', transKey: 'patientDirectory', icon: Users },
  ],
};

const ROLE_META = {
  superadmin: { label: 'Platform Administrator', transKey: 'superadmin', theme: 'pink' },
  admin: { label: 'System Administrator', transKey: 'admin', theme: 'blue' },
  receptionist: { label: 'Receptionist', transKey: 'receptionist', theme: 'blue' },
  doctor: { label: 'Physician', transKey: 'doctor', theme: 'blue' },
  nurse: { label: 'Nursing Staff', transKey: 'nurse', theme: 'pink' },
  lab: { label: 'Lab Technician', transKey: 'lab', theme: 'blue' },
  pharmacy: { label: 'Pharmacist', transKey: 'pharmacy', theme: 'blue' },
};

const getInitials = (name = '') =>
  name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || '??';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, changeLanguage, SUPPORTED_LANGUAGES, t } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(10);
  
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

  useEffect(() => {
    let timer;
    if (showLogoutModal && logoutCountdown > 0) {
      timer = setInterval(() => {
        setLogoutCountdown(prev => prev - 1);
      }, 1000);
    } else if (showLogoutModal && logoutCountdown === 0) {
      handleConfirmLogout();
    }
    return () => clearInterval(timer);
  }, [showLogoutModal, logoutCountdown]);

  const handleLogoutClick = () => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setLogoutCountdown(10);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate('/login');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
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
            <div className="flex items-center overflow-hidden shrink-0 py-1">
              <img src="/logo.png" alt="JanmaLink" className="h-10 w-auto" />
            </div>
          ) : (
            <button
              onClick={toggleSidebar}
              className="mx-auto flex items-center justify-center shrink-0 hover:scale-105 transition-all cursor-pointer bg-white"
            >
              <img src="/logo.png" alt="JL" className="h-8 w-auto object-cover object-left" style={{ maxWidth: '32px' }} />
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
              {meta.transKey ? t(meta.transKey) : meta.label}
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
              const displayLabel = item.transKey ? t(item.transKey) : item.label;

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
                    <span className="truncate opacity-100 transition-opacity duration-300 delay-100">{displayLabel}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={displayLabel}
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
              onClick={handleLogoutClick}
              className="w-full flex items-center justify-center gap-2 px-3 h-[40px] rounded-lg text-[13px] font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all cursor-pointer"
            >
              <LogOut size={16} className="shrink-0" />
              <span className="whitespace-nowrap">{t('logout')}</span>
            </button>
          ) : (
            <button
              onClick={handleLogoutClick}
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
            <div className="flex items-center md:hidden">
              <img src="/logo.png" alt="JanmaLink" className="h-8 w-auto" />
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
                  placeholder={t('search') + '...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[40px] bg-slate-50 text-slate-800 placeholder:text-slate-400 text-[13px] rounded-lg pl-10 pr-4 border border-slate-200 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </form>
            </div>
          )}

          {/* Right: Actions and User Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => { setLangDropdownOpen(o => !o); setProfileDropdownOpen(false); }}
                className="hidden sm:flex h-[36px] px-3 rounded-lg text-xs font-medium items-center gap-1.5 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm cursor-pointer"
                title="Change Language"
              >
                <Globe size={14} style={{ color: BLUE_DARK }} />
                <span>{SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeName || 'EN'}</span>
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden min-w-[140px]">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { changeLanguage(lang.code); setLangDropdownOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-[13px] hover:bg-blue-50 transition-colors cursor-pointer text-left ${
                        language === lang.code ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link
              to="/"
              className="hidden sm:flex h-[36px] px-3.5 rounded-lg text-xs font-medium items-center gap-2 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm"
            >
              <Globe size={14} style={{ color: PINK_DARK }} />
              <span>{t('hero_portal') || 'Patient Site'}</span>
            </Link>
            <button
              title="Notifications"
              className="relative w-[36px] h-[36px] rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-[8px] h-[8px] rounded-full border-2 border-white" style={{ backgroundColor: PINK }} />
            </button>
            <div className="relative">
              <div 
                className="flex items-center gap-3 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
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

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setProfileDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden py-1">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[13px] font-bold text-slate-800">{user?.name}</p>
                      <p className="text-[11px] text-slate-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </>
              )}
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
                  {meta.transKey ? t(meta.transKey) : meta.label}
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
                  const displayLabel = item.transKey ? t(item.transKey) : item.label;
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
                      <span>{displayLabel}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center justify-center gap-2 h-[44px] rounded-lg text-[14px] font-bold text-slate-600 hover:text-red-600 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-all"
              >
                <LogOut size={18} />
                <span>{t('logout')}</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-slate-200 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] z-40 shadow-lg">
        {navItems.slice(0, 4).map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const displayLabel = item.transKey ? t(item.transKey) : item.label;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <item.icon size={22} style={{ color: isActive ? BLUE_DARK : '#64748b' }} className="transition-colors" />
              <span className="text-[10px] font-semibold leading-none text-slate-700">{displayLabel.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
      {/* ── Logout Modal ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCancelLogout}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative z-10 flex flex-col items-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4 border border-red-100 shadow-sm">
              <LogOut size={28} />
            </div>
            <h2 className="text-xl font-bold font-heading text-slate-900 mb-2">{t('logout')}?</h2>
            <p className="text-sm text-slate-600 mb-6 px-2">
              Are you sure you want to securely log out of your session?
              <br/><br/>
              Auto-logging out in <strong className="text-red-600">{logoutCountdown}</strong> seconds...
            </p>
            <div className="w-full flex gap-3">
              <button 
                onClick={handleCancelLogout}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors border border-slate-200"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleConfirmLogout}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm shadow-red-200"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Layout;

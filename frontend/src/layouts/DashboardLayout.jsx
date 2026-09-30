import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: '▣' },
  { label: 'My Surveys', to: '/surveys', icon: '▤' },
  { label: 'Create Survey', to: '/surveys/create', icon: '+' },
  { label: 'Profile', to: '/profile', icon: '◉' },
];

const initials = (name = 'User') => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

function Avatar({ user, size = 'h-10 w-10' }) {
  return user?.profileImage ? (
    <img src={user.profileImage} alt={`${user.fullName || 'User'} profile`} className={`${size} rounded-full object-cover`} />
  ) : (
    <div className={`${size} flex items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700`}>
      {initials(user?.fullName)}
    </div>
  );
}

export function DashboardLayout() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageTitle = navItems.find((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))?.label || 'Dashboard';

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/60 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-slate-950 p-5 text-slate-100 shadow-2xl transition-transform duration-200 ease-out md:static md:z-auto md:w-[260px] md:max-w-none md:shrink-0 md:translate-x-0 md:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-8 flex items-center justify-between gap-3 px-3">
          <div className="flex items-center gap-3">
            <img src="/android-chrome-192x192.png" alt="SurveyHub" className="h-10 w-10 rounded-xl object-cover" />
            <p className="text-lg font-bold">SurveyHub</p>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            onClick={closeSidebar}
          >
            ✕
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeSidebar}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <span>{item.icon}</span><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <span>⎋</span><span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                aria-expanded={sidebarOpen}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-700 shadow-sm hover:bg-slate-50 md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">Overview</p>
                <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">{pageTitle}</h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Avatar user={currentUser} />
              <div className="hidden text-left sm:block">
                <p className="max-w-[180px] truncate text-sm font-semibold text-slate-900">{currentUser?.fullName || 'User'}</p>
                <p className="text-xs text-slate-500">{currentUser?.role || 'Creator'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}

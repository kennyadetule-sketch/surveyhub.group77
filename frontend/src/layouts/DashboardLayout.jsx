import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: "▣" },
  { label: "My Surveys", to: "/surveys", icon: "▤" },
  { label: "Create Survey", to: "/surveys/create", icon: "+" },
  { label: "Profile", to: "/profile", icon: "◉" },
];

const initials = (name = "User") => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

function Avatar({ user, size = "h-10 w-10" }) {
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
  const pageTitle = navItems.find((item) => location.pathname.startsWith(item.to))?.label || 'Dashboard';

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-full max-w-[260px] bg-slate-950 p-5 text-slate-100 md:flex md:flex-col">
        <div className="mb-8 flex items-center gap-3 px-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">S</div>
          <p className="text-lg font-bold">SurveyHub</p>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-6">
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white">
            <span>⎋</span><span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-sm font-medium text-slate-500">Overview</p><h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1></div>
            <div className="flex items-center gap-3">
              <Avatar user={currentUser} />
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-900">{currentUser?.fullName || 'User'}</p>
                <p className="text-xs text-slate-500">{currentUser?.role || 'Creator'}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}

import { Link, NavLink } from 'react-router-dom';

export function Navbar() {
  const navItems = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Login', to: '/login' },
    { label: 'Register', to: '/register' },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm">
            S
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">SurveyHub</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to="/login" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

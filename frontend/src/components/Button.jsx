export function Button({ children, variant = 'primary', size = 'md', type = 'button', className = '', disabled = false, onClick }) {
  const base = 'inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = 'blue', className = '' }) {
  const tones = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    slate: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
  };

  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`}>{children}</span>;
}

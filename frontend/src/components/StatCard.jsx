export function StatCard({ label, value, change, accent = 'blue' }) {
  const accents = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    purple: 'bg-violet-50 text-violet-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 inline-flex rounded-xl px-2.5 py-2 ${accents[accent]}`}>{label}</div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      {change && <p className="mt-2 text-sm text-slate-500">{change}</p>}
    </div>
  );
}

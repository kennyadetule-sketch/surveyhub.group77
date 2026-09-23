export function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-600">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      <span>{label}</span>
    </div>
  );
}

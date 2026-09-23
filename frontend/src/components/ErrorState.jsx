import { Button } from './Button';

export function ErrorState({ title = 'Something went wrong', message = 'Please try again.', actionLabel = 'Try Again', onAction }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl text-red-600">!</div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-600">{message}</p>
      {onAction && (
        <div className="mt-5">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}

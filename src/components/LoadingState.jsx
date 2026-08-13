import { Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Loading...', fullScreen = false }) {
  const wrapperClass = fullScreen
    ? 'min-h-screen flex flex-col items-center justify-center bg-slate-50'
    : 'flex flex-col items-center justify-center py-14';
  return (
    <div className={wrapperClass}>
      <Loader2 className="w-6 h-6 text-brand-600 animate-spin mb-2" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

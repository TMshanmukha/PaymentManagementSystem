import { X } from 'lucide-react';
import { useEffect } from 'react';

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-popover w-[calc(100%-1.5rem)] sm:w-full ${sizes[size]} max-h-[85vh] sm:max-h-[90vh] flex flex-col my-auto`}>
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-semibold text-navy-900 truncate pr-2">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 sm:px-5 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-t border-slate-100 flex flex-wrap justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

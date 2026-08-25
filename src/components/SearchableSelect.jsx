import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

/**
 * options: [{ value, label, meta? }] — meta is arbitrary extra text shown greyed-out (e.g. class/phone)
 */
export function SearchableSelect({ label, options, value, onChange, placeholder = 'Search and select...', error, loading }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()) ||
    (o.meta || '').toLowerCase().includes(query.toLowerCase()) ||
    (o.tags || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative">
      {label && <label className="label">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`input flex items-center justify-between text-left ${error ? 'border-red-400' : ''}`}
      >
        <span className={selected ? 'text-slate-900' : 'text-slate-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white rounded-lg shadow-popover border border-slate-100 max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a name, ID or phone..."
              className="w-full text-sm outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
          <div className="overflow-y-auto">
            {loading && <p className="text-sm text-slate-400 px-3 py-3">Loading...</p>}
            {!loading && filtered.length === 0 && <p className="text-sm text-slate-400 px-3 py-3">No matches found.</p>}
            {!loading && filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); setQuery(''); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex flex-col ${opt.value === value ? 'bg-brand-50' : ''}`}
              >
                <span className="text-slate-900 font-medium">{opt.label}</span>
                {opt.meta && <span className="text-xs text-slate-400">{opt.meta}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

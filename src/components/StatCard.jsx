export function StatCard({ label, value, sub, icon: Icon, tone = 'default' }) {
  const toneStyles = {
    default: 'bg-brand-50 text-brand-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-orange-50 text-orange-600',
    danger: 'bg-red-50 text-red-600',
  };
  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-navy-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      {Icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${toneStyles[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}

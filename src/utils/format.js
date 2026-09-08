export function formatCurrency(value) {
  const num = Number(value || 0);
  return num.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  if (typeof dateStr === 'string') {
    const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      return `${d}-${m}-${y}`;
    }
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatTime(dateStr) {
  if (!dateStr) return '';
  if (typeof dateStr === 'string') {
    const match = dateStr.trim().match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
    if (match && !dateStr.includes('T') && !dateStr.includes('Z')) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const strHours = String(hours).padStart(2, '0');
      return `${strHours}:${minutes} ${ampm}`;
    }
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const strHours = String(hours).padStart(2, '0');
  return `${strHours}:${minutes} ${ampm}`;
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = formatDate(dateStr);
  const t = formatTime(dateStr);
  return t ? `${d}, ${t}` : d;
}

export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function firstDayOfMonthISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

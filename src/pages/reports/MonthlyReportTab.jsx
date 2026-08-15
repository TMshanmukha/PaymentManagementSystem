import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { reportApi } from '../../services/report.service.js';
import { Card } from '../../components/Card.jsx';
import { StatCard } from '../../components/StatCard.jsx';
import { Button } from '../../components/Button.jsx';
import { Select } from '../../components/Select.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Badge } from '../../components/Badge.jsx';
import { LoadingState } from '../../components/LoadingState.jsx';
import { ErrorState } from '../../components/ErrorState.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { IndianRupee, TrendingDown, Wallet, Users } from 'lucide-react';
import { getErrorMessage } from '../../config/api.js';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function MonthlyReportTab({ studentType }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await reportApi.monthly(year, month, studentType);
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load monthly report.'));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [year, month, studentType]); // eslint-disable-line

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map((y) => ({ value: y, label: String(y) }));
  const monthOptions = MONTHS.map((m, i) => ({ value: i + 1, label: m }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 no-print">
        <div className="flex items-center gap-2 flex-1">
          <Select className="w-full sm:w-40" value={month} onChange={(e) => setMonth(Number(e.target.value))} options={monthOptions} />
          <Select className="w-full sm:w-32" value={year} onChange={(e) => setYear(Number(e.target.value))} options={yearOptions} />
        </div>
        <Button variant="secondary" className="sm:ml-auto w-full sm:w-auto justify-center" onClick={() => window.print()}><Printer className="w-4 h-4" /> Print</Button>
      </div>

      {loading && <LoadingState label="Loading report..." />}
      {error && <ErrorState message={error} onRetry={load} />}

      {data && (
        <div className="print-area print-a4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <StatCard label="Total Collection" value={formatCurrency(data.collection.total_collection)} icon={IndianRupee} tone="success" />
            <StatCard label="Total Expenses" value={formatCurrency(data.expenses.total_expenses)} icon={TrendingDown} tone="warning" />
            <StatCard label="Net Amount" value={formatCurrency(data.netAmount)} icon={Wallet} />
            <StatCard label="Students (Due/Paid)" value={`${data.studentSummary.students_with_due}/${data.studentSummary.students_fully_paid}`} icon={Users} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Card>
              <p className="text-sm text-slate-500">School Collection</p>
              <p className="text-xl font-bold text-navy-900">{formatCurrency(data.collection.school_collection)}</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">Tuition Collection</p>
              <p className="text-xl font-bold text-navy-900">{formatCurrency(data.collection.tuition_collection)}</p>
            </Card>
          </div>

          <Card>
            <p className="font-semibold text-navy-900 mb-4">Daily Collection — {MONTHS[month - 1]} {year}</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="payment_date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="cash" stackId="a" fill="#94a3b8" name="Cash" />
                  <Bar dataKey="upi" stackId="a" fill="#6366f1" name="UPI" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {data.expensesList && (
            <Card className="mt-4">
              <p className="font-semibold text-navy-900 mb-3">Monthly Expenses List</p>
              <DataTable
                columns={[
                  { key: 'expense_date', header: 'Date', render: (r) => formatDate(r.expense_date) },
                  { key: 'category_name', header: 'Category' },
                  { key: 'expense_type', header: 'Type', render: (r) => <Badge color={r.expense_type === 'SCHOOL' ? 'blue' : r.expense_type === 'TUITION' ? 'orange' : 'gray'}>{r.expense_type}</Badge> },
                  { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
                  { key: 'description', header: 'Description', render: (r) => r.description || '—' },
                  { key: 'created_by_name', header: 'Recorded By' },
                ]}
                rows={data.expensesList}
                loading={false}
                rowKey="id"
                emptyMessage="No expenses recorded for this month."
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

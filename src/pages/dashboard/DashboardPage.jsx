import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee, TrendingDown, Wallet, AlertCircle, Banknote, Smartphone,
  School, BookOpen, Plus, Users, FileText,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { reportApi } from '../../services/report.service.js';
import { StatCard } from '../../components/StatCard.jsx';
import { Card } from '../../components/Card.jsx';
import { Button } from '../../components/Button.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { LoadingState } from '../../components/LoadingState.jsx';
import { ErrorState } from '../../components/ErrorState.jsx';
import { Badge } from '../../components/Badge.jsx';
import { formatCurrency, formatDateTime } from '../../utils/format.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../config/constants.js';
import { getErrorMessage } from '../../config/api.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const base = user.role === ROLES.ADMIN ? '/admin' : user.role === ROLES.SCHOOL_ACCOUNTANT ? '/school' : '/tuition';
  const isAdmin = user.role === ROLES.ADMIN;

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await reportApi.dashboard();
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load dashboard data.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  return (
    <div>
      <PageHeader
        title={isAdmin ? "Today's Institution Overview" : "Today's Collection Summary"}
        description={isAdmin ? 'Real-time financial snapshot across school and tuition' : 'Your quick actions and collection summary'}
        actions={
          <>
            <Button onClick={() => navigate(`${base}/payments/new`)}><Plus className="w-4 h-4" /> New Payment</Button>
            <Button variant="secondary" onClick={() => navigate(`${base}/students`, { state: { openAddModal: true } })}><Users className="w-4 h-4" /> Add Student</Button>
          </>
        }
      />

      {/* Row 1 (Accountants Only) */}
      {!isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
          <StatCard label="Today's Collection" value={formatCurrency(data.todayCollection)} icon={IndianRupee} tone="success"
            sub={`${data.todayTransactionCount} transactions`} />
          <StatCard label="Total Outstanding Due" value={formatCurrency(data.totalOutstandingDue)} icon={AlertCircle} tone="danger" />
        </div>
      )}

      {/* Row 2 (Accountants Only) */}
      {!isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {user.role === ROLES.SCHOOL_ACCOUNTANT && (
            <StatCard label="School Collection" value={formatCurrency(data.schoolCollection)} icon={School} />
          )}
          {user.role === ROLES.TUITION_ACCOUNTANT && (
            <StatCard label="Tuition Collection" value={formatCurrency(data.tuitionCollection)} icon={BookOpen} />
          )}
          <StatCard label="Cash Collection" value={formatCurrency(data.cashCollection)} icon={Banknote} />
          <StatCard label="UPI Collection" value={formatCurrency(data.upiCollection)} icon={Smartphone} />
        </div>
      )}

      {/* Segment Breakdown for Admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* School Section Card */}
          <Card className="border-t-4 border-indigo-600 bg-gradient-to-br from-indigo-50/10 via-white to-white shadow-md p-6">
            <div className="flex items-center justify-between mb-4 border-b border-indigo-50 pb-3">
              <div className="flex items-center gap-2">
                <School className="w-5.5 h-5.5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-lg">School Segment Overview</h3>
              </div>
              <Badge color="blue">School</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-indigo-50/30 p-3 rounded-lg border border-indigo-100/50">
                <p className="text-xs text-slate-500 font-medium">Today's Collection</p>
                <p className="text-lg font-bold text-indigo-700 mt-0.5">{formatCurrency(data.schoolSummary.todayCollection)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Cash Collection</p>
                <p className="text-lg font-bold text-slate-700 mt-0.5">{formatCurrency(data.schoolSummary.cashCollection)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">UPI Collection</p>
                <p className="text-lg font-bold text-slate-700 mt-0.5">{formatCurrency(data.schoolSummary.upiCollection)}</p>
              </div>
              <div className="bg-indigo-50/20 p-3 rounded-lg border border-indigo-100/30 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Overall Collection</p>
                  <p className="text-lg font-bold text-indigo-700 mt-0.5">{formatCurrency(data.schoolSummary.overallCollection)}</p>
                </div>
                <div className="border-t border-indigo-100/65 mt-1.5 pt-1 text-[10px] text-slate-500">
                  Cash: <span className="font-semibold text-slate-700">{formatCurrency(data.schoolSummary.overallCashCollection)}</span> | UPI: <span className="font-semibold text-slate-700">{formatCurrency(data.schoolSummary.overallUpiCollection)}</span>
                </div>
              </div>
              <div className="bg-orange-50/30 p-3 rounded-lg border border-orange-100/50">
                <p className="text-xs text-slate-500 font-medium">Outstanding Due</p>
                <p className="text-lg font-bold text-orange-600 mt-0.5">{formatCurrency(data.schoolSummary.totalOutstandingDue)}</p>
              </div>
              <div className="bg-red-50/30 p-3 rounded-lg border border-red-100/50">
                <p className="text-xs text-slate-500 font-medium">Overall Expenses</p>
                <p className="text-lg font-bold text-red-600 mt-0.5">{formatCurrency(data.schoolSummary.overallExpenses)}</p>
              </div>
              <div className="bg-emerald-50/30 p-3 rounded-lg border border-emerald-100/50 col-span-1 sm:col-span-2 lg:col-span-2">
                <p className="text-xs text-slate-500 font-medium">Net Available Balance</p>
                <p className="text-lg font-bold text-emerald-600 mt-0.5">{formatCurrency(data.schoolSummary.overallNetCollection)}</p>
              </div>
            </div>
            <div className="space-y-2.5 mt-2">
              <SummaryRow label="Total Registered Students" value={data.schoolSummary.totalStudents} />
              <SummaryRow label="Students with Outstanding Dues" value={data.schoolSummary.studentsWithDue} tone="warning" />
              <SummaryRow label="Fully Paid Students" value={data.schoolSummary.studentsFullyPaid} tone="success" />
            </div>
          </Card>

          {/* Tuition Section Card */}
          <Card className="border-t-4 border-amber-500 bg-gradient-to-br from-amber-50/10 via-white to-white shadow-md p-6">
            <div className="flex items-center justify-between mb-4 border-b border-amber-50 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5.5 h-5.5 text-amber-500" />
                <h3 className="font-bold text-slate-800 text-lg">Tuition Segment Overview</h3>
              </div>
              <Badge color="orange">Tuition</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-amber-50/30 p-3 rounded-lg border border-amber-100/50">
                <p className="text-xs text-slate-500 font-medium">Today's Collection</p>
                <p className="text-lg font-bold text-amber-600 mt-0.5">{formatCurrency(data.tuitionSummary.todayCollection)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Cash Collection</p>
                <p className="text-lg font-bold text-slate-700 mt-0.5">{formatCurrency(data.tuitionSummary.cashCollection)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">UPI Collection</p>
                <p className="text-lg font-bold text-slate-700 mt-0.5">{formatCurrency(data.tuitionSummary.upiCollection)}</p>
              </div>
              <div className="bg-amber-50/20 p-3 rounded-lg border border-amber-100/30 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Overall Collection</p>
                  <p className="text-lg font-bold text-amber-600 mt-0.5">{formatCurrency(data.tuitionSummary.overallCollection)}</p>
                </div>
                <div className="border-t border-amber-100/65 mt-1.5 pt-1 text-[10px] text-slate-500">
                  Cash: <span className="font-semibold text-slate-750">{formatCurrency(data.tuitionSummary.overallCashCollection)}</span> | UPI: <span className="font-semibold text-slate-750">{formatCurrency(data.tuitionSummary.overallUpiCollection)}</span>
                </div>
              </div>
              <div className="bg-orange-50/30 p-3 rounded-lg border border-orange-100/50">
                <p className="text-xs text-slate-500 font-medium">Outstanding Due</p>
                <p className="text-lg font-bold text-orange-600 mt-0.5">{formatCurrency(data.tuitionSummary.totalOutstandingDue)}</p>
              </div>
              <div className="bg-red-50/30 p-3 rounded-lg border border-red-100/50">
                <p className="text-xs text-slate-500 font-medium">Overall Expenses</p>
                <p className="text-lg font-bold text-red-600 mt-0.5">{formatCurrency(data.tuitionSummary.overallExpenses)}</p>
              </div>
              <div className="bg-emerald-50/30 p-3 rounded-lg border border-emerald-100/50 col-span-1 sm:col-span-2 lg:col-span-2">
                <p className="text-xs text-slate-500 font-medium">Net Available Balance</p>
                <p className="text-lg font-bold text-emerald-600 mt-0.5">{formatCurrency(data.tuitionSummary.overallNetCollection)}</p>
              </div>
            </div>
            <div className="space-y-2.5 mt-2">
              <SummaryRow label="Total Registered Students" value={data.tuitionSummary.totalStudents} />
              <SummaryRow label="Students with Outstanding Dues" value={data.tuitionSummary.studentsWithDue} tone="warning" />
              <SummaryRow label="Fully Paid Students" value={data.tuitionSummary.studentsFullyPaid} tone="success" />
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <p className="font-semibold text-navy-900 mb-4">Monthly Collection Trend</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                {isAdmin && <Line type="monotone" dataKey="school" stroke="#6366f1" strokeWidth={2} dot={false} />}
                {isAdmin && <Line type="monotone" dataKey="tuition" stroke="#f59e0b" strokeWidth={2} dot={false} />}
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Student summary */}
        <Card className="flex flex-col justify-between">
          <div>
            <p className="font-semibold text-navy-900 mb-4">Combined Due Summary</p>
            <div className="space-y-3">
              <SummaryRow label="Total Students" value={data.studentSummary.totalStudents} />
              <SummaryRow label="Students with Due" value={data.studentSummary.studentsWithDue} tone="warning" />
              <SummaryRow label="Fully Paid Students" value={data.studentSummary.studentsFullyPaid} tone="success" />
            </div>
          </div>
          <Button variant="secondary" className="w-full mt-6" onClick={() => navigate(`${base}/due`)}>
            View Due Students
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent payments */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-navy-900">Recent Payments</p>
            <button onClick={() => navigate(`${base}/payments`)} className="text-xs text-brand-600 font-medium hover:underline">View all</button>
          </div>
          {data.recentPayments.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No payments recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentPayments.map((p) => (
                <div key={p.receipt_number} className="flex items-center justify-between text-sm gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 truncate">{p.student_name}</p>
                    <p className="text-xs text-slate-400 truncate">{p.receipt_number} · {p.accountant_name} · {formatDateTime(p.payment_time)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-emerald-600">{formatCurrency(p.amount)}</p>
                    <Badge color={p.payment_method === 'CASH' ? 'gray' : 'blue'}>{p.payment_method}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent expenses */}
        {isAdmin && (
          <Card>
            <p className="font-semibold text-navy-900 mb-4">Recent Expenses</p>
            {data.recentExpenses.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No expenses recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {data.recentExpenses.map((e, i) => (
                  <div key={i} className="flex items-center justify-between text-sm gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800 truncate">{e.category_name}</p>
                      <p className="text-xs text-slate-400 truncate">{e.expense_type} · {e.created_by_name}</p>
                    </div>
                    <p className="font-semibold text-red-500 shrink-0">-{formatCurrency(e.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, tone }) {
  const toneClass = tone === 'warning' ? 'text-orange-600' : tone === 'success' ? 'text-emerald-600' : 'text-navy-900';
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`font-semibold ${toneClass}`}>{value}</span>
    </div>
  );
}

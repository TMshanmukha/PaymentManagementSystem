import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { expenseSchema } from '../../schemas/expense.schema.js';
import { expenseApi } from '../../services/expense.service.js';
import { Card } from '../../components/Card.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Button } from '../../components/Button.jsx';
import { Input } from '../../components/Input.jsx';
import { Select } from '../../components/Select.jsx';
import { Modal } from '../../components/Modal.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { StatCard } from '../../components/StatCard.jsx';
import { Badge } from '../../components/Badge.jsx';
import { formatCurrency, formatDate, todayISO } from '../../utils/format.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage } from '../../config/api.js';
import { ROLES, ROLE_SCOPE } from '../../config/constants.js';
import { Wallet } from 'lucide-react';

export default function ExpensesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user.role === ROLES.ADMIN;
  const lockedType = ROLE_SCOPE[user.role];

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [expenseType, setExpenseType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: { expenseDate: todayISO(), expenseType: lockedType || 'SCHOOL', paymentMethod: 'CASH' },
  });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await expenseApi.list({ page, pageSize, expenseType: expenseType || undefined });
      setRows(data.data.items);
      setTotal(data.data.total);
      setTotalAmount(data.data.totalAmount);
    } catch {
      setError('Could not load expenses.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, expenseType]); // eslint-disable-line
  useEffect(() => { expenseApi.categories().then(({ data }) => setCategories(data.data)); }, []);

  async function onSubmit(values) {
    setServerError('');
    try {
      await expenseApi.create(values);
      toast.success('Expense added successfully.');
      setFormOpen(false);
      reset({ expenseDate: todayISO(), expenseType: lockedType || 'SCHOOL', paymentMethod: 'CASH' });
      load();
    } catch (err) {
      setServerError(getErrorMessage(err, 'Could not add expense.'));
    }
  }

  const columns = [
    { key: 'expense_date', header: 'Date', render: (r) => formatDate(r.expense_date) },
    { key: 'category_name', header: 'Category' },
    { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
    ...(isAdmin ? [{ key: 'expense_type', header: 'Type', render: (r) => <Badge color={r.expense_type === 'SCHOOL' ? 'blue' : 'orange'}>{r.expense_type}</Badge> }] : []),
    { key: 'payment_method', header: 'Method', render: (r) => <Badge color={r.payment_method === 'CASH' ? 'gray' : 'blue'}>{r.payment_method}</Badge> },
    { key: 'description', header: 'Description', render: (r) => r.description || '—' },
    { key: 'created_by_name', header: 'Created By' },
  ];

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track operational spending"
        actions={<Button onClick={() => setFormOpen(true)}><Plus className="w-4 h-4" /> Add Expense</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <StatCard label="Total Expenses (filtered)" value={formatCurrency(totalAmount)} icon={Wallet} tone="warning" />
        <StatCard label="Transactions" value={total} />
        {isAdmin && (
          <Select placeholder="All Types" value={expenseType} onChange={(e) => { setExpenseType(e.target.value); setPage(1); }}
            options={[{ value: 'SCHOOL', label: 'School' }, { value: 'TUITION', label: 'Tuition' }]} className="self-center" />
        )}
      </div>

      <Card>
        <DataTable columns={columns} rows={rows} loading={loading} error={error} onRetry={load} emptyMessage="No expenses recorded." />
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Add Expense"
        footer={<>
          <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Save Expense</Button>
        </>}>
        {serverError && <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-700">{serverError}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>
          <Select label="Category" placeholder="Select category" error={errors.categoryId?.message}
            options={categories.map((c) => ({ value: c.id, label: c.name }))} {...register('categoryId')} />
          <Input label="Amount (₹)" type="number" step="0.01" min="0" error={errors.amount?.message} {...register('amount')} />
          <Select label="Expense Type" disabled={Boolean(lockedType)} error={errors.expenseType?.message}
            options={[{ value: 'SCHOOL', label: 'School' }, { value: 'TUITION', label: 'Tuition' }]} {...register('expenseType')} />
          <Select label="Payment Method" error={errors.paymentMethod?.message}
            options={[{ value: 'CASH', label: 'Cash' }, { value: 'UPI', label: 'UPI' }]} {...register('paymentMethod')} />
          <Input label="Date" type="date" error={errors.expenseDate?.message} {...register('expenseDate')} />
          <Input label="Description (optional)" className="sm:col-span-2" {...register('description')} />
        </form>
      </Modal>
    </div>
  );
}

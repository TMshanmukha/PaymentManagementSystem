import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, IndianRupee } from 'lucide-react';
import { paymentSchema } from '../../schemas/payment.schema.js';
import { studentApi } from '../../services/student.service.js';
import { paymentApi } from '../../services/payment.service.js';
import { Card } from '../../components/Card.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Button } from '../../components/Button.jsx';
import { Input } from '../../components/Input.jsx';
import { Select } from '../../components/Select.jsx';
import { SearchableSelect } from '../../components/SearchableSelect.jsx';
import { getErrorMessage } from '../../config/api.js';
import { useToast } from '../../hooks/useToast.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES, ROLE_SCOPE } from '../../config/constants.js';
import { formatCurrency, todayISO } from '../../utils/format.js';
import { PaymentSuccessModal } from './PaymentSuccessModal.jsx';
// SignaturePad removed

export default function NewPaymentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const base = user.role === ROLES.ADMIN ? '/admin' : user.role === ROLES.SCHOOL_ACCOUNTANT ? '/school' : '/tuition';
  const scope = ROLE_SCOPE[user.role]; // null for admin -> can pick either type, filtered client-side by chosen student

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [serverError, setServerError] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [clientRequestId] = useState(() => `req-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const preselectedStudentId = location.state?.studentId ? String(location.state.studentId) : '';

  const {
    register, handleSubmit, watch, setValue, control, formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: { studentId: preselectedStudentId, paymentDate: todayISO(), paymentMethod: 'CASH', digitalSignature: user.fullName || '' },
  });

  const studentId = watch('studentId');
  const amount = watch('amount');
  const watchSignature = watch('digitalSignature');

  useEffect(() => {
    if (user?.fullName && !watchSignature) {
      setValue('digitalSignature', user.fullName);
    }
  }, [user, setValue]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    studentApi.list({ status: 'ACTIVE', pageSize: 200, studentType: scope || undefined })
      .then(({ data }) => setStudents(data.data.items))
      .finally(() => setLoadingStudents(false));
  }, []); // eslint-disable-line

  useEffect(() => {
    const s = students.find((s) => s.student_id === Number(studentId));
    setSelectedStudent(s || null);
  }, [studentId, students]);

  const options = useMemo(() => students.map((s) => ({
    value: s.student_id,
    label: `${s.student_name} (${s.student_code})`,
    meta: `${s.parent_name} · ${s.class || '—'} · Due: ${formatCurrency(s.due_amount)}`,
  })), [students]);

  async function onSubmit(values) {
    setServerError('');
    const isAdmin = user.role === ROLES.ADMIN;
    if (isAdmin && !values.digitalSignature) {
      setServerError('Digital signature is required.');
      return;
    }
    try {
      const { data } = await paymentApi.create({ ...values, clientRequestId });
      toast.success('Payment recorded successfully.');
      setReceipt(data.data);
    } catch (err) {
      setServerError(getErrorMessage(err, 'Could not record payment.'));
    }
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <PageHeader title="Record Payment" description="Search the student, enter the amount received, and save" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          {serverError && <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-700">{serverError}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Controller
              control={control}
              name="studentId"
              render={({ field }) => (
                <SearchableSelect
                  label="Student"
                  options={options}
                  value={field.value}
                  onChange={field.onChange}
                  loading={loadingStudents}
                  error={errors.studentId?.message}
                  placeholder="Search by name, ID, or phone..."
                />
              )}
            />

            {selectedStudent && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-lg p-3 text-sm">
                <div><p className="text-slate-400 text-xs">Parent</p><p className="font-medium truncate">{selectedStudent.parent_name}</p></div>
                <div><p className="text-slate-400 text-xs">Type</p><p className="font-medium">{selectedStudent.student_type}</p></div>
                <div><p className="text-slate-400 text-xs">Total Fee</p><p className="font-medium">{formatCurrency(selectedStudent.total_fee)}</p></div>
                <div><p className="text-slate-400 text-xs">Previously Paid</p><p className="font-medium">{formatCurrency(selectedStudent.paid_amount)}</p></div>
                <div className="col-span-2 sm:col-span-4 border-t border-slate-200 pt-2">
                  <p className="text-slate-400 text-xs">Current Due</p>
                  <p className="font-bold text-orange-600">{formatCurrency(selectedStudent.due_amount)}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Current Payment (₹)" type="number" step="0.01" min="0" error={errors.amount?.message} {...register('amount')} />
              <Select label="Payment Method" error={errors.paymentMethod?.message}
                options={[{ value: 'CASH', label: 'Cash' }, { value: 'UPI', label: 'UPI' }]}
                {...register('paymentMethod')} />
              <Input label="Payment Date" type="date" error={errors.paymentDate?.message} {...register('paymentDate')} />
              <Input label="Remarks (optional)" {...register('remarks')} />
            </div>

            {user.role === ROLES.ADMIN && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <Input
                  label="Digital Signature (Type your name to sign)"
                  placeholder="Type your name to sign"
                  error={errors.digitalSignature?.message}
                  {...register('digitalSignature', { required: user.role === ROLES.ADMIN ? 'Signature is required' : false })}
                />
                {watchSignature && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Signature Preview</p>
                    <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }} className="text-2xl text-slate-800 font-semibold select-none">
                      {watchSignature}
                    </span>
                  </div>
                )}
              </div>
            )}

            {selectedStudent && amount > 0 && (
              <div className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800 flex justify-between">
                <span>New Due After This Payment</span>
                <span className="font-bold">{formatCurrency(Math.max(0, selectedStudent.due_amount - Number(amount || 0)))}</span>
              </div>
            )}

            <Button type="submit" className="w-full" loading={isSubmitting}>
              <IndianRupee className="w-4 h-4" /> Save & Generate Receipt
            </Button>
          </form>
        </Card>

        <Card>
          <p className="font-semibold text-navy-900 mb-2">Tip</p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Search the student first — their fee, previous payments, and current due load automatically.
            You only need to enter the amount the parent actually paid and how (Cash or UPI).
          </p>
        </Card>
      </div>

      <PaymentSuccessModal
        receipt={receipt}
        onClose={() => { setReceipt(null); navigate(`${base}/payments`); }}
        onNewPayment={() => window.location.reload()}
      />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, KeyRound, Power } from 'lucide-react';
import { createUserSchema } from '../../schemas/user.schema.js';
import { userApi } from '../../services/user.service.js';
import { Card } from '../../components/Card.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Button } from '../../components/Button.jsx';
import { Input } from '../../components/Input.jsx';
import { Select } from '../../components/Select.jsx';
import { Modal } from '../../components/Modal.jsx';
import { ConfirmationModal } from '../../components/ConfirmationModal.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Badge } from '../../components/Badge.jsx';
import { formatDate } from '../../utils/format.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage } from '../../services/api.js';
import { ROLE_LABELS } from '../../config/constants.js';

export default function UsersPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [serverError, setServerError] = useState('');
  const [statusTarget, setStatusTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(createUserSchema) });

  async function load() {
    setLoading(true);
    try {
      const { data } = await userApi.list();
      setRows(data.data);
    } catch {
      toast.error('Could not load users.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []); // eslint-disable-line

  async function onSubmit(values) {
    setServerError('');
    try {
      await userApi.create(values);
      toast.success('Accountant added successfully.');
      setFormOpen(false);
      reset({});
      load();
    } catch (err) {
      setServerError(getErrorMessage(err, 'Could not add user.'));
    }
  }

  async function handleToggleStatus() {
    setBusy(true);
    try {
      const newStatus = statusTarget.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await userApi.updateStatus(statusTarget.id, newStatus);
      toast.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}.`);
      setStatusTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword() {
    setBusy(true);
    try {
      await userApi.resetPassword(resetTarget.id, newPassword);
      toast.success('Password reset successfully.');
      setResetTarget(null);
      setNewPassword('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const columns = [
    { key: 'full_name', header: 'Name' },
    { key: 'username', header: 'Username' },
    { key: 'role', header: 'Role', render: (r) => ROLE_LABELS[r.role] },
    { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'created_at', header: 'Created', render: (r) => formatDate(r.created_at) },
    { key: 'last_login_at', header: 'Last Login', render: (r) => r.last_login_at ? formatDate(r.last_login_at) : 'Never' },
    {
      key: 'actions', header: 'Actions', render: (r) => (
        <div className="flex gap-1">
          <button onClick={() => setResetTarget(r)} className="btn-ghost !px-2"><KeyRound className="w-4 h-4" /></button>
          <button onClick={() => setStatusTarget(r)} className={`btn-ghost !px-2 ${r.status === 'ACTIVE' ? 'text-red-500' : 'text-emerald-500'}`}><Power className="w-4 h-4" /></button>
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader title="User Management" description="Manage school and tuition accountant accounts"
        actions={<Button onClick={() => setFormOpen(true)}><Plus className="w-4 h-4" /> Add Accountant</Button>} />

      <Card>
        <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No accountants added yet." />
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Add Accountant"
        footer={<>
          <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Add Accountant</Button>
        </>}>
        {serverError && <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-700">{serverError}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>
          <Input label="Full Name" className="sm:col-span-2" error={errors.fullName?.message} {...register('fullName')} />
          <Input label="Username" error={errors.username?.message} {...register('username')} />
          <Input label="Email (optional)" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Phone (optional)" {...register('phone')} />
          <Select label="Role" placeholder="Select role" error={errors.role?.message}
            options={[{ value: 'SCHOOL_ACCOUNTANT', label: 'School Accountant' }, { value: 'TUITION_ACCOUNTANT', label: 'Tuition Accountant' }]}
            {...register('role')} />
          <Input label="Password" type="password" className="sm:col-span-2" error={errors.password?.message} {...register('password')} />
        </form>
      </Modal>

      <ConfirmationModal
        open={Boolean(statusTarget)} onClose={() => setStatusTarget(null)} onConfirm={handleToggleStatus} loading={busy}
        title={statusTarget?.status === 'ACTIVE' ? 'Deactivate this user?' : 'Activate this user?'}
        message={`${statusTarget?.full_name} will ${statusTarget?.status === 'ACTIVE' ? 'no longer be able to log in.' : 'be able to log in again.'}`}
        confirmLabel={statusTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        confirmVariant={statusTarget?.status === 'ACTIVE' ? 'danger' : 'primary'}
      />

      <Modal open={Boolean(resetTarget)} onClose={() => { setResetTarget(null); setNewPassword(''); }} title={`Reset Password — ${resetTarget?.full_name}`}
        footer={<>
          <Button variant="secondary" onClick={() => setResetTarget(null)}>Cancel</Button>
          <Button onClick={handleResetPassword} loading={busy} disabled={newPassword.length < 8}>Reset Password</Button>
        </>}>
        <Input label="New Password" type="password" placeholder="At least 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Check, Play } from 'lucide-react';
import { academicYearApi } from '../../services/academicYear.service.js';
import { Card } from '../../components/Card.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Button } from '../../components/Button.jsx';
import { Input } from '../../components/Input.jsx';
import { Modal } from '../../components/Modal.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Badge } from '../../components/Badge.jsx';
import { formatDate } from '../../utils/format.js';
import { useToast } from '../../hooks/useToast.js';
import { useAcademicYear } from '../../context/AcademicYearContext.jsx';
import { getErrorMessage } from '../../config/api.js';

const academicYearSchema = z.object({
  yearName: z.string().min(1, 'Year Name is required').regex(/^\d{4}-\d{2}$/, 'Format must be YYYY-YY (e.g. 2026-27)'),
  startDate: z.string().min(1, 'Start Date is required'),
  endDate: z.string().min(1, 'End Date is required'),
  isActive: z.boolean().optional().default(false),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: "End Date must be after Start Date",
  path: ["endDate"],
});

export default function AcademicYearsPage() {
  const toast = useToast();
  const { refreshAcademicYears, changeSelectedYear } = useAcademicYear();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [serverError, setServerError] = useState('');
  const [activatingId, setActivatingId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(academicYearSchema),
    defaultValues: { yearName: '', startDate: '', endDate: '', isActive: false },
  });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await academicYearApi.list();
      setRows(data.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load academic years.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(values) {
    setServerError('');
    try {
      const { data } = await academicYearApi.create(values);
      toast.success('Academic year added successfully.');
      setFormOpen(false);
      reset({ yearName: '', startDate: '', endDate: '', isActive: false });
      
      // Reload UI
      await load();
      await refreshAcademicYears();
      
      // If set as active, automatically switch to it
      if (values.isActive && data.data?.id) {
        changeSelectedYear(data.data.id);
      }
    } catch (err) {
      setServerError(getErrorMessage(err, 'Could not add academic year.'));
    }
  }

  async function handleActivate(id) {
    setActivatingId(id);
    try {
      await academicYearApi.activate(id);
      toast.success('Academic year activated successfully.');
      
      // Refresh list & global context
      await load();
      await refreshAcademicYears();
      
      // Automatically update selection to the active year
      changeSelectedYear(id);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not activate academic year.'));
    } finally {
      setActivatingId(null);
    }
  }

  const columns = [
    { key: 'year_name', header: 'Year Name' },
    { key: 'start_date', header: 'Start Date', render: (r) => formatDate(r.start_date) },
    { key: 'end_date', header: 'End Date', render: (r) => formatDate(r.end_date) },
    {
      key: 'is_active',
      header: 'Status',
      render: (r) => (
        r.is_active ? <Badge color="green">Active / Current</Badge> : <Badge color="gray">Inactive</Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        !r.is_active ? (
          <Button
            size="sm"
            variant="secondary"
            loading={activatingId === r.id}
            onClick={() => handleActivate(r.id)}
            className="flex items-center gap-1"
          >
            <Play className="w-3.5 h-3.5" /> Activate
          </Button>
        ) : (
          <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
            <Check className="w-4 h-4 text-green-500" /> Current Year
          </span>
        )
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Academic Years"
        description="Manage school academic sessions and activation statuses"
        actions={<Button onClick={() => setFormOpen(true)}><Plus className="w-4 h-4" /> Add Academic Year</Button>}
      />

      <Card className="mt-4">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={load}
          emptyMessage="No academic sessions recorded."
        />
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add Academic Year"
        footer={<>
          <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Save Session</Button>
        </>}
      >
        {serverError && <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-700">{serverError}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Year Name"
            placeholder="e.g. 2026-27"
            error={errors.yearName?.message}
            {...register('yearName')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              error={errors.startDate?.message}
              {...register('startDate')}
            />
            <Input
              label="End Date"
              type="date"
              error={errors.endDate?.message}
              {...register('endDate')}
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
              {...register('isActive')}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
              Set as current active academic year
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSchema } from '../../schemas/student.schema.js';
import { studentApi } from '../../services/student.service.js';
import { academicYearApi } from '../../services/academicYear.service.js';
import { Modal } from '../../components/Modal.jsx';
import { Input } from '../../components/Input.jsx';
import { Select } from '../../components/Select.jsx';
import { Button } from '../../components/Button.jsx';
import { getErrorMessage } from '../../config/api.js';
import { useToast } from '../../hooks/useToast.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES, ROLE_SCOPE } from '../../config/constants.js';
import { todayISO } from '../../utils/format.js';

export function StudentFormModal({ open, onClose, onSuccess, student, defaultClass }) {
  const { user } = useAuth();
  const toast = useToast();
  const isEdit = Boolean(student);
  const lockedType = ROLE_SCOPE[user.role]; // accountants can only add their own type

  const [academicYears, setAcademicYears] = useState([]);
  const [serverError, setServerError] = useState('');

  const {
    register, handleSubmit, reset, formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(studentSchema) });

  useEffect(() => {
    if (open) {
      academicYearApi.list().then(({ data }) => {
        const years = data.data;
        setAcademicYears(years);
        const activeYear = years.find((y) => y.is_active);
        reset(student ? {
          name: student.student_name, parentName: student.parent_name, parentPhone: student.parent_phone,
          studentPhone: '', class: student.class || '', section: student.section || '',
          studentType: student.student_type, academicYearId: String(student.academic_year_id),
          totalFee: student.total_fee, joiningDate: todayISO(), address: '', status: student.status,
        } : {
          studentType: lockedType || 'SCHOOL',
          academicYearId: activeYear ? String(activeYear.id) : '',
          joiningDate: todayISO(),
          status: 'ACTIVE',
          class: defaultClass || '',
          section: '',
          name: '',
          parentName: '',
          parentPhone: '',
          studentPhone: '',
          totalFee: '',
          address: '',
        });
      });
      setServerError('');
    }
  }, [open, student, defaultClass]); // eslint-disable-line

  async function onSubmit(values) {
    setServerError('');
    try {
      if (isEdit) {
        await studentApi.update(student.student_id, values);
        toast.success('Student updated successfully.');
      } else {
        await studentApi.create(values);
        toast.success('Student added successfully.');
        reset();
      }
      onSuccess();
    } catch (err) {
      setServerError(getErrorMessage(err, 'Could not save student.'));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Student' : 'Add Student'} size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>{isEdit ? 'Save Changes' : 'Add Student'}</Button>
        </>
      }>
      {serverError && <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-700">{serverError}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>
        <Input label="Student Name" error={errors.name?.message} {...register('name')} />
        <Input label="Parent Name" error={errors.parentName?.message} {...register('parentName')} />
        <Input label="Parent Phone" error={errors.parentPhone?.message} {...register('parentPhone')} />
        <Input label="Student Phone (optional)" {...register('studentPhone')} />
        <Input label="Class" {...register('class')} />
        <Input label="Section (optional)" {...register('section')} />
        <Select label="Student Type" error={errors.studentType?.message} disabled={Boolean(lockedType)}
          options={[{ value: 'SCHOOL', label: 'School' }, { value: 'TUITION', label: 'Tuition' }]}
          {...register('studentType')} />
        <Select label="Academic Year" placeholder="Select year" error={errors.academicYearId?.message}
          options={academicYears.map((y) => ({ value: String(y.id), label: y.year_name }))}
          {...register('academicYearId')} />
        <Input label="Total Fee (₹)" type="number" step="0.01" min="0" error={errors.totalFee?.message} {...register('totalFee')} />
        <Input label="Joining Date" type="date" error={errors.joiningDate?.message} {...register('joiningDate')} />
        <Input label="Address (optional)" className="sm:col-span-2" {...register('address')} />
        {isEdit && (
          <Select label="Status" options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }]} {...register('status')} />
        )}
      </form>
    </Modal>
  );
}

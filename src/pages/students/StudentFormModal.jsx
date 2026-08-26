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
    register, handleSubmit, reset, setValue, formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(studentSchema) });

  const [siblingClass, setSiblingClass] = useState('');
  const [siblingSection, setSiblingSection] = useState('');
  const [siblingStudents, setSiblingStudents] = useState([]);
  const [siblingLoading, setSiblingLoading] = useState(false);
  const [selectedSiblingId, setSelectedSiblingId] = useState('');

  // Reset sibling states on open
  useEffect(() => {
    if (open) {
      setSiblingClass('');
      setSiblingSection('');
      setSiblingStudents([]);
      setSelectedSiblingId('');
    }
  }, [open]);

  useEffect(() => {
    if (siblingClass) {
      setSiblingLoading(true);
      studentApi.list({
        class: siblingClass || undefined,
        section: siblingSection || undefined,
        pageSize: 1000,
        status: 'ACTIVE',
      }).then(({ data }) => {
        setSiblingStudents(data.data.items || []);
      }).catch((err) => {
        console.error('Failed to load sibling options', err);
      }).finally(() => {
        setSiblingLoading(false);
      });
    } else {
      setSiblingStudents([]);
    }
  }, [siblingClass, siblingSection]);

  useEffect(() => {
    if (open) {
      academicYearApi.list().then(({ data }) => {
        const years = data.data;
        setAcademicYears(years);
        const activeYear = years.find((y) => y.is_active);
        reset(student ? {
          name: student.student_name, parentName: student.parent_name, parentPhone: student.parent_phone,
          studentPhone: '', class: student.class || '', section: student.section || '',
          studentType: student.student_type, admissionType: student.admission_type || 'REGULAR', academicYearId: String(student.academic_year_id),
          totalFee: student.total_fee, joiningDate: todayISO(), address: '', status: student.status,
        } : {
          studentType: lockedType || 'SCHOOL',
          admissionType: 'REGULAR',
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
        let cancelDues = false;
        if (student.status === 'ACTIVE' && values.status === 'INACTIVE' && Number(student.due_amount || 0) > 0) {
          const proceed = window.confirm(
            `Warning: This student has an outstanding due balance of ₹${Number(student.due_amount).toFixed(2)}. Marking them inactive will cancel this due by setting their total academic fee to their total paid amount (₹${Number(student.paid_amount).toFixed(2)}). Do you want to proceed?`
          );
          if (!proceed) return;
          cancelDues = true;
        }
        await studentApi.update(student.student_id, { ...values, cancelDues });
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
        <Select label="Admission Type" error={errors.admissionType?.message}
          options={[{ value: 'REGULAR', label: 'Regular' }, { value: 'SCHOLARSHIP', label: 'Scholarship (Free Seat)' }]}
          {...register('admissionType')} />
        <Select label="Academic Year" placeholder="Select year" error={errors.academicYearId?.message}
          options={academicYears.map((y) => ({ value: String(y.id), label: y.year_name }))}
          {...register('academicYearId')} />
        <Input label="Total Fee (₹)" type="number" step="0.01" min="0" error={errors.totalFee?.message} {...register('totalFee')} />
        <Input label="Joining Date" type="date" error={errors.joiningDate?.message} {...register('joiningDate')} />
        <Input label="Address (optional)" className="sm:col-span-2" {...register('address')} />
        {isEdit && (
          <Select label="Status" options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }]} {...register('status')} />
        )}

        {/* Sibling Autofill Details Section */}
        <div className="sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
          <p className="font-semibold text-navy-900 text-sm mb-3">Sibling Details (Autofill Parent Details)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="label text-slate-500 font-medium">Sibling's Class</label>
              <input
                type="text"
                placeholder="e.g. 5, 10th"
                className="input w-full bg-white"
                value={siblingClass}
                onChange={(e) => setSiblingClass(e.target.value)}
              />
            </div>
            <div>
              <label className="label text-slate-500 font-medium">Sibling's Section (Optional)</label>
              <input
                type="text"
                placeholder="e.g. A, B"
                className="input w-full bg-white"
                value={siblingSection}
                onChange={(e) => setSiblingSection(e.target.value)}
              />
            </div>
            <div>
              <label className="label text-slate-500 font-medium">Select Sibling Student</label>
              <select
                className="input w-full bg-white"
                value={selectedSiblingId}
                disabled={siblingLoading || siblingStudents.length === 0}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedSiblingId(id);
                  if (id) {
                    const sib = siblingStudents.find(s => String(s.student_id) === id || s.student_id === Number(id));
                    if (sib) {
                      setValue('parentName', sib.parent_name);
                      setValue('parentPhone', sib.parent_phone);
                      toast.success(`Linked sibling: ${sib.student_name}. Parent details filled.`);
                    }
                  }
                }}
              >
                <option value="">{siblingLoading ? 'Loading...' : (siblingClass ? (siblingStudents.length === 0 ? 'No students found' : 'Select sibling...') : 'Enter class first')}</option>
                {siblingStudents.map(s => (
                  <option key={s.student_id} value={String(s.student_id)}>{s.student_name} ({s.student_code})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

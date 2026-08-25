import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Eye, ArrowLeft, Users, GraduationCap } from 'lucide-react';
import { studentApi } from '../../services/student.service.js';
import { Card } from '../../components/Card.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Button } from '../../components/Button.jsx';
import { Select } from '../../components/Select.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { Badge } from '../../components/Badge.jsx';
import { formatCurrency } from '../../utils/format.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { ROLES } from '../../config/constants.js';
import { StudentFormModal } from './StudentFormModal.jsx';
import { ExportModal } from './ExportModal.jsx';
import { getErrorMessage } from '../../config/api.js';
import { exportToExcel } from '../../utils/export.js';

export default function StudentsListPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const base = user.role === ROLES.ADMIN ? '/admin' : user.role === ROLES.SCHOOL_ACCOUNTANT ? '/school' : '/tuition';
  const isAdmin = user.role === ROLES.ADMIN;

  const [rows, setRows] = useState([]);

  const handleExport = async () => {
    try {
      const classFilter = selectedClass === 'all' ? undefined : (selectedClass === 'unassigned' ? '' : selectedClass);
      const { data } = await studentApi.list({
        pageSize: 5000,
        studentType: studentType || undefined,
        admissionType: admissionType || undefined,
        status: status || undefined,
        class: classFilter
      });
      const items = data.data.items;
      const headers = [
        { key: 'student_code', label: 'Student Code' },
        { key: 'student_name', label: 'Student Name' },
        { key: 'parent_name', label: 'Parent Name' },
        { key: 'parent_phone', label: 'Parent Phone' },
        { key: 'class', label: 'Class' },
        { key: 'section', label: 'Section' },
        { key: 'student_type', label: 'Student Type' },
        { key: 'total_fee', label: 'Total Fee' },
        { key: 'paid_amount', label: 'Paid Amount' },
        { key: 'due_amount', label: 'Due Amount' },
        { key: 'status', label: 'Status' }
      ];
      exportToExcel(items, `students_class_${selectedClass}`, headers);
    } catch (err) {
      toast.error('Could not export class students.');
    }
  };

  const handleExportAll = async () => {
    try {
      const { data } = await studentApi.list({
        pageSize: 5000,
        studentType: studentType || undefined,
        admissionType: admissionType || undefined
      });
      const items = data.data.items;
      const headers = [
        { key: 'student_code', label: 'Student Code' },
        { key: 'student_name', label: 'Student Name' },
        { key: 'parent_name', label: 'Parent Name' },
        { key: 'parent_phone', label: 'Parent Phone' },
        { key: 'class', label: 'Class' },
        { key: 'section', label: 'Section' },
        { key: 'student_type', label: 'Student Type' },
        { key: 'total_fee', label: 'Total Fee' },
        { key: 'paid_amount', label: 'Paid Amount' },
        { key: 'due_amount', label: 'Due Amount' },
        { key: 'status', label: 'Status' }
      ];
      exportToExcel(items, 'all_students_register', headers);
    } catch (err) {
      toast.error('Could not export all students.');
    }
  };
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [search, setSearch] = useState('');
  const [studentType, setStudentType] = useState('');
  const [admissionType, setAdmissionType] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // Class-wise view states
  const [classes, setClasses] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null); // null means grid view, 'all' or class value means list view

  async function loadClasses(typeFilter) {
    setLoadingClasses(true);
    setError('');
    try {
      const { data } = await studentApi.getClasses({
        studentType: typeFilter || undefined,
        admissionType: admissionType || undefined
      });
      const responseData = data.data;
      if (responseData && responseData.classes) {
        setClasses(responseData.classes);
        setActiveCount(responseData.activeCount || 0);
        setInactiveCount(responseData.inactiveCount || 0);
      } else {
        setClasses(responseData || []);
        setActiveCount((responseData || []).reduce((acc, c) => acc + c.student_count, 0));
        setInactiveCount(0);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load classes.'));
    } finally {
      setLoadingClasses(false);
    }
  }

  async function load() {
    if (selectedClass === null) return;
    setLoading(true);
    setError('');
    try {
      const classFilter = selectedClass === 'all' ? undefined : (selectedClass === 'unassigned' ? '' : selectedClass);
      const { data } = await studentApi.list({
        page,
        pageSize,
        search: search || undefined,
        studentType: studentType || undefined,
        admissionType: admissionType || undefined,
        status: status || undefined,
        class: classFilter,
      });
      setRows(data.data.items);
      setTotal(data.data.total);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load students.'));
    } finally {
      setLoading(false);
    }
  }

  // Load classes initially and when type filter changes
  useEffect(() => {
    if (selectedClass === null) {
      loadClasses(studentType);
    }
  }, [studentType, admissionType, selectedClass]);

  // Handle Dashboard "Add Student" navigation state
  useEffect(() => {
    if (location.state?.openAddModal) {
      setFormOpen(true);
      // Clear location state immediately
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Load students when pagination/filters change or class is selected
  useEffect(() => {
    if (selectedClass !== null) {
      load();
    }
  }, [page, studentType, admissionType, status, selectedClass]); // eslint-disable-line

  // Handle search typing with debounce
  useEffect(() => {
    if (selectedClass !== null) {
      const t = setTimeout(() => { setPage(1); load(); }, 350);
      return () => clearTimeout(t);
    }
  }, [search]); // eslint-disable-line

  const columns = [
    { key: 'student_code', header: 'ID' },
    { key: 'student_name', header: 'Student' },
    { key: 'parent_name', header: 'Parent' },
    { key: 'parent_phone', header: 'Phone' },
    { key: 'class', header: 'Class', render: (r) => r.class || '—' },
    ...(isAdmin ? [{ key: 'student_type', header: 'Type', render: (r) => <Badge color={r.student_type === 'SCHOOL' ? 'blue' : 'orange'}>{r.student_type}</Badge> }] : []),
    { key: 'admission_type', header: 'Admission Category', render: (r) => <Badge color={r.admission_type === 'REGULAR' ? 'emerald' : 'purple'}>{r.admission_type === 'REGULAR' ? 'Regular' : 'Scholarship'}</Badge> },
    { key: 'total_fee', header: 'Total Fee', render: (r) => formatCurrency(r.total_fee) },
    { key: 'paid_amount', header: 'Paid', render: (r) => formatCurrency(r.paid_amount) },
    { key: 'due_amount', header: 'Due', render: (r) => <span className={r.due_amount > 0 ? 'text-orange-600 font-medium' : 'text-emerald-600'}>{formatCurrency(r.due_amount)}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
    {
      key: 'actions', header: 'Actions', render: (r) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`${base}/students/${r.student_id}`)} className="btn-ghost !px-2" title="View Profile"><Eye className="w-4 h-4" /></button>
        </div>
      )
    },
  ];

  // Aggregated metrics for All Students card
  const totalStudentCount = classes.reduce((sum, c) => sum + c.student_count, 0);
  const totalFees = classes.reduce((sum, c) => sum + Number(c.total_fee || 0), 0);
  const totalPaid = classes.reduce((sum, c) => sum + Number(c.paid_amount || 0), 0);
  const totalDue = classes.reduce((sum, c) => sum + Number(c.due_amount || 0), 0);

  return (
    <div>
      {selectedClass !== null && (
        <button
          onClick={() => setSelectedClass(null)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Classes
        </button>
      )}

      <PageHeader
        title={selectedClass !== null ? `Students - Class ${selectedClass === 'all' ? 'All' : (selectedClass === 'unassigned' ? 'Unassigned' : selectedClass)}` : 'Students by Class'}
        description={selectedClass !== null ? 'View and search student profiles in this class' : 'Select a class box to view relative students'}
        actions={
          <div className="flex items-center gap-3">
            {isAdmin && selectedClass === null && (
              <Select
                value={studentType}
                onChange={(e) => { setStudentType(e.target.value); }}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'SCHOOL', label: 'School Only' },
                  { value: 'TUITION', label: 'Tuition Only' },
                ]}
                className="w-40 sm:w-44"
              />
            )}
            {selectedClass === null && (
              <Select
                value={admissionType}
                onChange={(e) => { setAdmissionType(e.target.value); }}
                options={[
                  { value: '', label: 'All Categories' },
                  { value: 'REGULAR', label: 'Regular Students' },
                  { value: 'SCHOLARSHIP', label: 'Scholarship Students' },
                ]}
                className="w-40 sm:w-44"
              />
            )}
            <Button variant="secondary" onClick={() => setExportOpen(true)} className="no-print">
              Export to Excel
            </Button>
            <Button onClick={() => setFormOpen(true)}><Plus className="w-4 h-4" /> Add Student</Button>
          </div>
        }
      />

      <div className="flex gap-4 mb-4 text-xs font-semibold text-slate-500 no-print">
        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          Active Students: {activeCount}
        </span>
        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
          Inactive Students: {inactiveCount}
        </span>
      </div>

      {selectedClass === null ? (
        // Grid View of Class boxes
        <div>
          <div className="mb-6 max-w-md no-print">
            <div className="relative flex">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="input pl-9 rounded-r-none"
                  placeholder="Search name, ID, parent, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSelectedClass('all');
                    }
                  }}
                />
              </div>
              <Button
                className="rounded-l-none"
                onClick={() => setSelectedClass('all')}
              >
                Search
              </Button>
            </div>
          </div>

          {loadingClasses ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-xl p-5 h-44 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="h-6 w-24 bg-slate-100 rounded"></div>
                  <div className="h-8 w-8 bg-slate-100 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-50 rounded"></div>
                  <div className="h-4 w-3/4 bg-slate-50 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
            <p className="text-red-700 text-sm font-medium mb-3">{error}</p>
            <Button onClick={loadClasses}>Retry</Button>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-xl p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No students added yet.</p>
            <p className="text-sm text-slate-400 mt-1">Get started by adding your first student.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* All Students Card */}
            <div
              onClick={() => setSelectedClass('all')}
              className="group bg-gradient-to-br from-indigo-50/50 via-white to-brand-50/10 hover:to-brand-50/40 border border-slate-150 rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between h-48 border-brand-100/60 hover:border-brand-300/80"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-brand-700 transition-colors">All Students</h3>
                  <span className="text-xs text-slate-400 font-medium">Complete list of all classes</span>
                </div>
                <div className="bg-brand-50 text-brand-600 p-2.5 rounded-lg group-hover:bg-brand-100 transition-colors">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-3 mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 font-medium">Total Students</span>
                  <span className="font-semibold text-slate-800">{totalStudentCount}</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 font-medium">Total Fees</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(totalFees)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Remaining Due</span>
                  <span className="font-semibold text-orange-600">{formatCurrency(totalDue)}</span>
                </div>
              </div>
            </div>

            {/* Individual Class Cards */}
            {classes.map((c, idx) => {
              const classVal = c.class || 'unassigned';
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedClass(classVal)}
                  className="group bg-white hover:bg-slate-50/30 border border-slate-150 rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between h-48 hover:border-brand-250"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-brand-600 transition-colors">
                        {c.class ? `Class ${c.class}` : 'Unassigned'}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">{c.student_count} {c.student_count === 1 ? 'Student' : 'Students'}</span>
                    </div>
                    <div className="bg-slate-50 text-slate-500 p-2.5 rounded-lg group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-3 mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">Total Fees</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(c.total_fee)}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">Paid</span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(c.paid_amount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Due</span>
                      <span className="font-semibold text-orange-600">{formatCurrency(c.due_amount)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  ) : (
        // Students List Table for Selected Class
        <Card>
          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <div className="relative flex flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="input pl-9 rounded-r-none"
                  placeholder="Search name, parent, ID, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setPage(1);
                      load();
                    }
                  }}
                />
              </div>
              <Button className="rounded-l-none" onClick={() => { setPage(1); load(); }}>Search</Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {isAdmin && (
                <Select className="w-full sm:w-40" placeholder="All Types" value={studentType} onChange={(e) => { setStudentType(e.target.value); setPage(1); }}
                  options={[{ value: 'SCHOOL', label: 'School' }, { value: 'TUITION', label: 'Tuition' }]} />
              )}
              <Select className="w-full sm:w-40" placeholder="All Categories" value={admissionType} onChange={(e) => { setAdmissionType(e.target.value); setPage(1); }}
                options={[{ value: 'REGULAR', label: 'Regular' }, { value: 'SCHOLARSHIP', label: 'Scholarship' }]} />
              <Select className="w-full sm:w-40" placeholder="All Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }]} />
            </div>
          </div>

          <DataTable columns={columns} rows={rows} loading={loading} error={error} onRetry={load} rowKey="student_id" emptyMessage="No students found." />
          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </Card>
      )}

      <StudentFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => { setFormOpen(false); if (selectedClass !== null) load(); loadClasses(); }}
        defaultClass={selectedClass && selectedClass !== 'all' && selectedClass !== 'unassigned' ? selectedClass : ''}
      />

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        studentType={studentType}
        status={status}
      />
    </div>
  );
}

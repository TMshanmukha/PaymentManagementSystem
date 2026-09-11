import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { AcademicYearProvider } from './context/AcademicYearContext.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { RoleRoute } from './routes/RoleRoute.jsx';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';
import { LoadingState } from './components/LoadingState.jsx';
import { ROLES } from './config/constants.js';

import LoginPage from './pages/auth/LoginPage.jsx';

const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage.jsx'));
const StudentsListPage = lazy(() => import('./pages/students/StudentsListPage.jsx'));
const StudentDetailPage = lazy(() => import('./pages/students/StudentDetailPage.jsx'));
const PaymentsListPage = lazy(() => import('./pages/payments/PaymentsListPage.jsx'));
const NewPaymentPage = lazy(() => import('./pages/payments/NewPaymentPage.jsx'));
const PaymentDetailPage = lazy(() => import('./pages/payments/PaymentDetailPage.jsx'));
const ExpensesPage = lazy(() => import('./pages/expenses/ExpensesPage.jsx'));
const DuePage = lazy(() => import('./pages/due/DuePage.jsx'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage.jsx'));
const DayClosingPage = lazy(() => import('./pages/dayclosing/DayClosingPage.jsx'));
const UsersPage = lazy(() => import('./pages/users/UsersPage.jsx'));
const AuditLogsPage = lazy(() => import('./pages/auditlogs/AuditLogsPage.jsx'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage.jsx'));
const AcademicYearsPage = lazy(() => import('./pages/academicYears/AcademicYearsPage.jsx'));

/**
 * One shared set of page routes reused for all three role sections
 * (admin/school/tuition) — the pages themselves adapt their content
 * and available actions based on the logged-in user's role.
 */
function roleSection(basePath, title, extraChildren = null) {
  return (
    <Route path={basePath} element={<DashboardLayout title={title} />}>
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="students" element={<StudentsListPage />} />
      <Route path="students/:id" element={<StudentDetailPage />} />
      <Route path="payments" element={<PaymentsListPage />} />
      <Route path="payments/new" element={<NewPaymentPage />} />
      <Route path="payments/:id" element={<PaymentDetailPage />} />
      <Route path="expenses" element={<ExpensesPage />} />
      <Route path="due" element={<DuePage />} />
      <Route path="day-closing" element={<DayClosingPage />} />
      {extraChildren}
      <Route index element={<Navigate to="dashboard" replace />} />
    </Route>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <AcademicYearProvider>
            <ToastProvider>
              <Suspense fallback={<LoadingState fullScreen />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />

                  <Route element={<ProtectedRoute />}>
                    {/* Admin-only subtree */}
                    <Route path="/admin" element={<RoleRoute allow={[ROLES.ADMIN]} />}>
                      {roleSection('', 'Admin', (
                        <>
                          <Route path="reports" element={<ReportsPage />} />
                          <Route path="users" element={<UsersPage />} />
                          <Route path="audit-logs" element={<AuditLogsPage />} />
                          <Route path="settings" element={<SettingsPage />} />
                          <Route path="academic-years" element={<AcademicYearsPage />} />
                        </>
                      ))}
                    </Route>

                    {/* School accountant subtree */}
                    <Route path="/school" element={<RoleRoute allow={[ROLES.SCHOOL_ACCOUNTANT]} />}>
                      {roleSection('', 'School Accountant')}
                    </Route>

                    {/* Tuition accountant subtree */}
                    <Route path="/tuition" element={<RoleRoute allow={[ROLES.TUITION_ACCOUNTANT]} />}>
                      {roleSection('', 'Tuition Accountant')}
                    </Route>
                  </Route>

                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </Suspense>
            </ToastProvider>
          </AcademicYearProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}

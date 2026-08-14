import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { RoleRoute } from './routes/RoleRoute.jsx';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';
import { ROLES } from './config/constants.js';

import LoginPage from './pages/auth/LoginPage.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import StudentsListPage from './pages/students/StudentsListPage.jsx';
import StudentDetailPage from './pages/students/StudentDetailPage.jsx';
import PaymentsListPage from './pages/payments/PaymentsListPage.jsx';
import NewPaymentPage from './pages/payments/NewPaymentPage.jsx';
import PaymentDetailPage from './pages/payments/PaymentDetailPage.jsx';
import ExpensesPage from './pages/expenses/ExpensesPage.jsx';
import DuePage from './pages/due/DuePage.jsx';
import ReportsPage from './pages/reports/ReportsPage.jsx';
import DayClosingPage from './pages/dayclosing/DayClosingPage.jsx';
import UsersPage from './pages/users/UsersPage.jsx';
import AuditLogsPage from './pages/auditlogs/AuditLogsPage.jsx';
import SettingsPage from './pages/settings/SettingsPage.jsx';

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
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<ProtectedRoute />}>
                {/* Admin-only subtree */}
                <Route element={<RoleRoute allow={[ROLES.ADMIN]} />}>
                  {roleSection('/admin', 'Admin', (
                    <>
                      <Route path="expenses" element={<ExpensesPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="users" element={<UsersPage />} />
                      <Route path="audit-logs" element={<AuditLogsPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </>
                  ))}
                </Route>

                {/* School accountant subtree */}
                <Route element={<RoleRoute allow={[ROLES.SCHOOL_ACCOUNTANT]} />}>
                  {roleSection('/school', 'School Accountant')}
                </Route>

                {/* Tuition accountant subtree */}
                <Route element={<RoleRoute allow={[ROLES.TUITION_ACCOUNTANT]} />}>
                  {roleSection('/tuition', 'Tuition Accountant')}
                </Route>
              </Route>

              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}

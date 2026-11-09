import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/api/auth'

import LoginPage from '@/pages/Login'
import StaffLayout from '@/layouts/StaffLayout'
import EmployeeLayout from '@/layouts/EmployeeLayout'
import RequireAuth from '@/components/RequireAuth'

import AdminDashboard from '@/pages/staff/Dashboard'
import EmployeesPage from '@/pages/staff/Employees'
import DepartmentsPage from '@/pages/staff/Departments'
import LeavePage from '@/pages/staff/Leave'
import PayrollPage from '@/pages/staff/Payroll'
import AnnouncementsPage from '@/pages/staff/Announcements'
import UsersPage from '@/pages/staff/Users'

import EmployeeDashboard from '@/pages/employee/Dashboard'
import MyProfilePage from '@/pages/employee/Profile'
import MyLeavePage from '@/pages/employee/Leave'
import MyAttendancePage from '@/pages/employee/Attendance'
import MyPayrollPage from '@/pages/employee/Payroll'
import MyNotificationsPage from '@/pages/employee/Notifications'
import ChangePasswordPage from '@/pages/employee/ChangePassword'

export default function App() {
  const { token, setAuth, user } = useAuthStore()

  useEffect(() => {
    if (token && !user) {
      authApi.me().then((me) => setAuth(token, me)).catch(() => {})
    }
  }, [token, user, setAuth])

  return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
            element={
              <RequireAuth allowedRoles={['ROLE_ADMIN', 'ROLE_HR_MANAGER']}>
                <StaffLayout />
              </RequireAuth>
            }
        >
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/leave" element={<LeavePage />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>

        <Route
            element={
              <RequireAuth allowedRoles={['ROLE_EMPLOYEE', 'ROLE_ADMIN', 'ROLE_HR_MANAGER']}>
                <EmployeeLayout />
              </RequireAuth>
            }
        >
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/profile" element={<MyProfilePage />} />
          <Route path="/employee/leave" element={<MyLeavePage />} />
          <Route path="/employee/attendance" element={<MyAttendancePage />} />
          <Route path="/employee/payroll" element={<MyPayrollPage />} />
          <Route path="/employee/notifications" element={<MyNotificationsPage />} />
          <Route path="/employee/change-password" element={<ChangePasswordPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  )
}
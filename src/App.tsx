import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import TimeTrackingPage from './pages/TimeTrackingPage';
import SchedulePage from './pages/SchedulePage';
import LeaveRequestPage from './pages/LeaveRequestPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminEmployees from './pages/AdminEmployees';
import AdminSchedule from './pages/AdminSchedule';
import AdminLeaveRequests from './pages/AdminLeaveRequests';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Protected route component that checks if user is authenticated
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard\" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard\" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="time-tracking" element={<TimeTrackingPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="leave-requests" element={<LeaveRequestPage />} />
        <Route path="profile" element={<ProfilePage />} />
        
        {/* Admin Routes */}
        <Route path="admin" element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="admin/employees" element={
          <ProtectedRoute adminOnly>
            <AdminEmployees />
          </ProtectedRoute>
        } />
        <Route path="admin/schedule" element={
          <ProtectedRoute adminOnly>
            <AdminSchedule />
          </ProtectedRoute>
        } />
        <Route path="admin/leave-requests" element={
          <ProtectedRoute adminOnly>
            <AdminLeaveRequests />
          </ProtectedRoute>
        } />
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
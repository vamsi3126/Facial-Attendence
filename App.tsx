import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import MarkAttendance from './pages/MarkAttendance';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminReports from './pages/AdminReports';
import AdminKiosk from './pages/AdminKiosk';
import { api } from './services/mockBackend';
import { User, UserRole } from './types';

interface ProtectedRouteProps {
  user: User | null;
  allowedRole?: UserRole;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, allowedRole, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRole && user.role !== allowedRole) {
     // Redirect based on actual role
     return <Navigate to={user.role === UserRole.ADMIN ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }
  return <>{children}</>;
};

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => (
  <div className="flex bg-slate-50 min-h-screen">
    {user && <Sidebar user={user} onLogout={onLogout} />}
    <main className={`flex-1 transition-all duration-300 ${user ? 'ml-64' : ''}`}>
      {children}
    </main>
  </div>
);

const App: React.FC = () => {
  // Initialize user from localStorage to persist session across refreshes
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('faceauth_session_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLogin = async (email: string) => {
    try {
      const loggedUser = await api.login(email);
      setUser(loggedUser);
      localStorage.setItem('faceauth_session_user', JSON.stringify(loggedUser));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('faceauth_session_user');
  };

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" replace />} />
          
          {/* Root Redirect Logic */}
          <Route path="/" element={
            user ? (
              <Navigate to={user.role === UserRole.ADMIN ? '/admin/dashboard' : '/student/dashboard'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute user={user} allowedRole={UserRole.STUDENT}>
              <StudentDashboard user={user!} />
            </ProtectedRoute>
          } />
          <Route path="/student/history" element={
            <ProtectedRoute user={user} allowedRole={UserRole.STUDENT}>
              <StudentDashboard user={user!} />
            </ProtectedRoute>
          } />
          <Route path="/student/mark-attendance" element={
             <ProtectedRoute user={user} allowedRole={UserRole.STUDENT}>
               <MarkAttendance user={user!} />
             </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute user={user} allowedRole={UserRole.ADMIN}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
           <Route path="/admin/students" element={
            <ProtectedRoute user={user} allowedRole={UserRole.ADMIN}>
              <AdminStudents />
            </ProtectedRoute>
          } />
           <Route path="/admin/reports" element={
            <ProtectedRoute user={user} allowedRole={UserRole.ADMIN}>
              <AdminReports />
            </ProtectedRoute>
          } />
          <Route path="/admin/kiosk" element={
            <ProtectedRoute user={user} allowedRole={UserRole.ADMIN}>
              <AdminKiosk />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
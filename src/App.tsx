import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Subjects = lazy(() => import('./pages/Subjects'));
const Timetable = lazy(() => import('./pages/Timetable'));
const Faculty = lazy(() => import('./pages/Faculty'));
const Practicals = lazy(() => import('./pages/Practicals'));
const Assignments = lazy(() => import('./pages/Assignments'));
const Settings = lazy(() => import('./pages/Settings'));
const Pricing = lazy(() => import('./pages/Pricing'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const NotificationCenter = lazy(() => import('./pages/NotificationCenter'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Groups = lazy(() => import('./pages/Groups'));
const GroupDashboard = lazy(() => import('./pages/GroupDashboard'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

const TitleUpdater = () => {
  const location = useLocation();
  
  useEffect(() => {
    const path = location.pathname;
    let title = 'Smart Student Tracker';
    
    if (path === '/') title = 'Welcome | Smart Student Tracker';
    else if (path === '/login') title = 'Login | Smart Student Tracker';
    else if (path === '/register') title = 'Register | Smart Student Tracker';
    else if (path === '/dashboard') title = 'Dashboard | Smart Student Tracker';
    else if (path === '/subjects') title = 'Subjects | Smart Student Tracker';
    else if (path === '/assignments') title = 'Assignments | Smart Student Tracker';
    else if (path === '/timetable') title = 'Timetable | Smart Student Tracker';
    else if (path === '/faculty') title = 'Faculty | Smart Student Tracker';
    else if (path === '/practicals') title = 'Practicals | Smart Student Tracker';
    else if (path === '/settings') title = 'Settings | Smart Student Tracker';
    else if (path === '/pricing') title = 'Pricing | Smart Student Tracker';
    else if (path === '/admin') title = 'Admin Panel | Smart Student Tracker';
    else if (path === '/notifications') title = 'Notifications | Smart Student Tracker';
    else if (path === '/analytics') title = 'Analytics | Smart Student Tracker';
    else if (path === '/groups') title = 'Groups | Smart Student Tracker';
    else if (path.startsWith('/groups/')) title = 'Group Dashboard | Smart Student Tracker';
    
    document.title = title;
  }, [location]);
  
  return null;
};

const PageFallback = () => (
  <div className="flex items-center justify-center h-screen bg-bg-main">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) return <PageFallback />;
  if (!token) return <Navigate to="/" />; 
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { token } = useAuth();

  return (
    <Router>
      <TitleUpdater />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={token ? <Navigate to="/dashboard" /> : <LandingPage />} 
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <ProtectedRoute>
                <Subjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <Assignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timetable"
            element={
              <ProtectedRoute>
                <Timetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty"
            element={
              <ProtectedRoute>
                <Faculty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practicals"
            element={
              <ProtectedRoute>
                <Practicals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <ProtectedRoute>
                <Pricing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <Groups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:groupId"
            element={
              <ProtectedRoute>
                <GroupDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <ThemeProvider>
            <AppRoutes />
          </ThemeProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyEnrolledCourses from './pages/MyEnrolledCourses';
import CourseView from './pages/CourseView';
import Profile from './pages/Profile';
import MyCertificates from './pages/MyCertificates';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminAnalytics from './pages/AdminAnalytics';

const StudentRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/admin-login" />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (user) {
    return user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />;
  }
  
  return children;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route 
            path="/dashboard" 
            element={
              <StudentRoute>
                <Dashboard />
              </StudentRoute>
            } 
          />
          <Route 
            path="/enrolled" 
            element={
              <StudentRoute>
                <MyEnrolledCourses />
              </StudentRoute>
            } 
          />
          <Route 
            path="/learn/:courseId" 
            element={
              <StudentRoute>
                <CourseView />
              </StudentRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/certificates" 
            element={
              <StudentRoute>
                <MyCertificates />
              </StudentRoute>
            } 
          />
          <Route path="/admin-login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
          <Route 
            path="/admin" 
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <AdminProtectedRoute>
                <AdminAnalytics />
              </AdminProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ProjectDashboard } from './pages/ProjectDashboard';
import { ProjectDetail } from './pages/ProjectDetail';
import { Toaster } from 'react-hot-toast';

// A simple protected route wrapper to ensure unauthenticated users can't see the dashboard
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <>
    <Toaster position="top-right" />
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        {/* The main dashboard route */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ProjectDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* The Task Detail view */}
        <Route 
          path="/projects/:projectId" 
          element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
    </>
  );
}

export default App;
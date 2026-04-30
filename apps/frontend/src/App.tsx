import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { type ReactNode } from 'react';

// A simple protected route wrapper to ensure unauthenticated users can't see the dashboard
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Placeholder for the Phase 3 Dashboard
const DashboardPlaceholder = () => {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome, {user?.name}!</h1>
      <p>This is your protected dashboard. Only logged-in users can see this.</p>
      <button onClick={logout} style={{ padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Logout
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardPlaceholder />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
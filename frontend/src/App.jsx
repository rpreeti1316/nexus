import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectSettingsPage from './pages/ProjectSettingsPage';
import './App.css';

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute><ProjectsPage /></ProtectedRoute>
            } />
            <Route path="/projects/:id" element={
              <ProtectedRoute><ProjectDetailPage /></ProtectedRoute>
            } />
            <Route path="/projects/:id/settings" element={
              <ProtectedRoute><ProjectSettingsPage /></ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ResidentPortal from './components/resident/ResidentPortal';
import AdminPortal from './components/admin/AdminPortal';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hostel-user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (data) => {
    setUser(data);
    localStorage.setItem('hostel-user', JSON.stringify(data));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hostel-user');
  };

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user || !allowedRoles.includes(user.type)) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router>
    <div className="App">
        <Routes>
          <Route path="/" element={<Login user={user} onLogin={handleLogin} />} />
          <Route
            path="/resident"
            element={
              <ProtectedRoute allowedRoles={['resident']}>
                <ResidentPortal user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPortal user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </div>
    </Router>
  );
}

export default App;

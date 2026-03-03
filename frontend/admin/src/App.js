import React, { useState, useEffect } from 'react';
import Login from './component/Login';
import AdminPanel from './components/AdminPanel';
import { clearAuthToken } from './middleware/apiMiddleware';

import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      // Note: logout API call is handled by apiMiddleware and service.js
      const { logout } = await import('./service');
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthToken();
      setIsAuthenticated(false);
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <AdminPanel onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;

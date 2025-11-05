import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import './App.css';

axios.defaults.withCredentials = true;
const API_BASE = 'http://localhost:8000/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_BASE}/check-auth`);
      setIsAuthenticated(response.data.authenticated);
      setUser(response.data.user || null);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      {isAuthenticated ? (
        <Home user={user} onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <Login onLogin={checkAuth} />
      )}
    </div>
  );
}

export default App;
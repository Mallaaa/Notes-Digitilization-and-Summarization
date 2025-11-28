import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/HomeDashboard';
import UploadNotes from './components/UploadNotes';
import History from './components/History';
import UserManagement from './components/UserManagement';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      setIsLoggedIn(true);
      setCurrentUser(user);
      setIsAdmin(user.email === 'admin@notesapp.com');
    }
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    setCurrentPage('dashboard');
    setIsAdmin(userData.email === 'admin@notesapp.com');
    localStorage.setItem('authToken', 'demo-token');
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setCurrentPage('login');
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <>
          <header className="app-header">
            <div className="header-content">
              <h1>SmartNoteScan</h1>
              <nav className="main-nav">
                <button 
                  className={currentPage === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
                  onClick={() => navigateTo('dashboard')}
                >
                  Home 
                </button>
                <button 
                  className={currentPage === 'upload' ? 'nav-btn active' : 'nav-btn'}
                  onClick={() => navigateTo('upload')}
                >
                  Upload Notes
                </button>
                <button 
                  className={currentPage === 'history' ? 'nav-btn active' : 'nav-btn'}
                  onClick={() => navigateTo('history')}
                >
                  History
                </button>
                {isAdmin && (
                  <button 
                    className={currentPage === 'users' ? 'nav-btn active' : 'nav-btn'}
                    onClick={() => navigateTo('users')}
                  >
                    Users
                  </button>
                )}
                <button className="nav-btn logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </nav>
            </div>
          </header>
          
          <main className="main-content">
            {currentPage === 'dashboard' && <Dashboard user={currentUser} />}
            {currentPage === 'upload' && <UploadNotes user={currentUser} />}
            {currentPage === 'history' && <History user={currentUser} />}
            {currentPage === 'users' && isAdmin && <UserManagement />}
          </main>
        </>
      ) : (
        <>
          {currentPage === 'login' ? (
            <Login onLogin={handleLogin} onSwitchToSignup={() => setCurrentPage('signup')} />
          ) : (
            <Signup onLogin={handleLogin} onSwitchToLogin={() => setCurrentPage('login')} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
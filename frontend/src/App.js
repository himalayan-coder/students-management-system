// App.js - Full routing with session timeout + admin-only routes

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import StudentList    from './components/StudentList';
import AddStudent     from './components/AddStudent';
import EditStudent    from './components/EditStudent';
import Login          from './components/Login';
import ChangePassword from './components/ChangePassword';
import ManageTeachers from './components/ManageTeachers';
import './App.css';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// ─── Check session expiry ────────────────────────────────────────────────────
function checkSession() {
  const loginTime = parseInt(localStorage.getItem('loginTime') || '0');
  if (loginTime && Date.now() - loginTime > SESSION_TIMEOUT) {
    localStorage.clear();
    return false;
  }
  return localStorage.getItem('isLoggedIn') === 'true';
}

// ─── Protected Route ─────────────────────────────────────────────────────────
function ProtectedRoute({ children, adminOnly = false }) {
  const isLoggedIn = checkSession();
  const role       = localStorage.getItem('teacherRole');

  if (!isLoggedIn)               return <Navigate to="/login" />;
  if (adminOnly && role !== 'admin') return <Navigate to="/" />;
  return children;
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const navigate    = useNavigate();
  const isLoggedIn  = checkSession();
  const teacherName = localStorage.getItem('teacherName')     || 'Teacher';
  const role        = localStorage.getItem('teacherRole')     || 'teacher';

  // Auto logout when session expires
  useEffect(() => {
    if (!isLoggedIn && localStorage.getItem('loginTime')) {
      localStorage.clear();
      navigate('/login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <h1>🎓 Student Management System</h1>
      {isLoggedIn && (
        <div className="nav-links">
          <span className="teacher-name">
            {role === 'admin' ? '👑' : '👤'} {teacherName}
            <span className={`role-badge role-${role}`}>{role}</span>
          </span>
          <Link to="/">All Students</Link>
          <Link to="/add">Add Student</Link>
          {role === 'admin' && <Link to="/manage-teachers">Manage Teachers</Link>}
          <Link to="/change-password">Change Password</Link>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected - all logged-in teachers */}
          <Route path="/"                element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
          <Route path="/add"             element={<ProtectedRoute><AddStudent /></ProtectedRoute>} />
          <Route path="/edit/:id"        element={<ProtectedRoute><EditStudent /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/manage-teachers" element={<ProtectedRoute adminOnly={true}><ManageTeachers /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

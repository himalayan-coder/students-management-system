import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import StudentList from './components/StudentList';
import AddStudent  from './components/AddStudent';
import EditStudent from './components/EditStudent';
import Login       from './components/Login';
import './App.css';

function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function Navbar() {
  const navigate    = useNavigate();
  const isLoggedIn  = localStorage.getItem('isLoggedIn') === 'true';
  const teacherName = localStorage.getItem('teacherName') || 'Teacher';

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('teacherName');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <h1>🎓 Student Management System</h1>
      {isLoggedIn && (
        <div className="nav-links">
          <span className="teacher-name">👤 {teacherName}</span>
          <Link to="/">All Students</Link>
          <Link to="/add">Add Student</Link>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/"         element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
          <Route path="/add"      element={<ProtectedRoute><AddStudent /></ProtectedRoute>} />
          <Route path="/edit/:id" element={<ProtectedRoute><EditStudent /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StudentList from './components/StudentList';
import AddStudent from './components/AddStudent';
import EditStudent from './components/EditStudent';
import './App.css';

function App() {
  return (
    <Router>
      <nav className="navbar">
        <h1>🎓 Student Management System</h1>
        <div className="nav-links">
          <Link to="/">All Students</Link>
          <Link to="/add">Add Student</Link>
        </div>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/"         element={<StudentList />} />
          <Route path="/add"      element={<AddStudent />} />
          <Route path="/edit/:id" element={<EditStudent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

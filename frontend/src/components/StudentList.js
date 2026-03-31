import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function StudentList() {
  const [students,   setStudents]   = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message,    setMessage]    = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = () => {
    axios.get('http://localhost:5000/api/students')
      .then((res) => setStudents(res.data))
      .catch((err) => console.log('Error:', err));
  };

  const deleteStudent = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      axios.delete(`http://localhost:5000/api/students/${id}`)
        .then(() => { setMessage('Student deleted successfully!'); fetchStudents(); })
        .catch((err) => console.log('Error:', err));
    }
  };

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.rollNumber.toLowerCase().includes(term) ||
      s.course.toLowerCase().includes(term)
    );
  });

  return (
    <div className="card">
      <div className="list-header">
        <h2>All Students</h2>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, roll number or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>}
        </div>
      </div>

      {message && <p className="success-msg">{message}</p>}
      <p className="student-count">Total: <strong>{filteredStudents.length}</strong> student(s){searchTerm && ` found for "${searchTerm}"`}</p>

      {students.length === 0 ? (
        <p>No students found. Please add a student.</p>
      ) : filteredStudents.length === 0 ? (
        <p className="error-msg">No students found matching your search.</p>
      ) : (
        <table>
          <thead>
            <tr><th>#</th><th>Name</th><th>Roll Number</th><th>Email</th><th>Course</th><th>Age</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredStudents.map((s, i) => (
              <tr key={s._id}>
                <td>{i + 1}</td><td>{s.name}</td><td>{s.rollNumber}</td>
                <td>{s.email}</td><td>{s.course}</td><td>{s.age}</td>
                <td>
                  <button className="btn-edit" onClick={() => navigate(`/edit/${s._id}`)}>Edit</button>
                  <button className="btn-delete" onClick={() => deleteStudent(s._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StudentList;

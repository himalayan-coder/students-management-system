import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [message, setMessage]   = useState('');
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
        .then(() => { setMessage('Student deleted!'); fetchStudents(); })
        .catch((err) => console.log('Error:', err));
    }
  };

  return (
    <div className="card">
      <h2>All Students</h2>
      {message && <p className="success-msg">{message}</p>}
      {students.length === 0 ? <p>No students found. Please add a student.</p> : (
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Roll Number</th><th>Email</th><th>Course</th><th>Age</th><th>Actions</th></tr></thead>
          <tbody>
            {students.map((s, i) => (
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

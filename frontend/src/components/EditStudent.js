import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', rollNumber: '', email: '', course: '', age: '' });
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/students/${id}`)
      .then((res) => setFormData(res.data))
      .catch((err) => console.log('Error:', err));
  }, [id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5000/api/students/${id}`, formData)
      .then(() => { setMessage('Student updated successfully!'); setError(''); setTimeout(() => navigate('/'), 1500); })
      .catch(() => { setError('Error updating student.'); setMessage(''); });
  };

  return (
    <div className="card">
      <h2>Edit Student</h2>
      {message && <p className="success-msg">{message}</p>}
      {error   && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSubmit}>
        {['name','rollNumber','email','course','age'].map((field) => (
          <div className="form-group" key={field}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
            <input type={field === 'age' ? 'number' : field === 'email' ? 'email' : 'text'} name={field} value={formData[field]} onChange={handleChange} required />
          </div>
        ))}
        <button type="submit" className="btn-primary">Update Student</button>
        <button type="button" style={{ marginLeft: '10px', backgroundColor: '#95a5a6', color: 'white' }} onClick={() => navigate('/')}>Cancel</button>
      </form>
    </div>
  );
}
export default EditStudent;

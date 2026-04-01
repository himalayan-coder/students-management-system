import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import IDCard from './IDCard';

function AddStudent() {
  const [formData, setFormData] = useState({
    name: '', rollNumber: '', email: '', course: '',
    dateOfBirth: '', gender: '', phone: '', address: '',
    guardianName: '', guardianPhone: ''
  });
  const [photo,      setPhoto]      = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [message,    setMessage]    = useState('');
  const [error,      setError]      = useState('');
  const [newStudent, setNewStudent] = useState(null); // for ID card
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) { setPhoto(file); setPreview(URL.createObjectURL(file)); setPhotoError(''); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(''); setError('');

    // Photo is required
    if (!photo) { setPhotoError('⚠️ Student photo is required!'); return; }

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    data.append('photo', photo);

    axios.post('http://localhost:5000/api/students', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then((res) => {
        setMessage('✅ Student added successfully! ID Card is ready.');
        setNewStudent(res.data); // show ID card
      })
      .catch((err) => {
        const msg = err.response?.data?.message || '';
        if (msg.includes('email') || msg.includes('E11000')) {
          setError('❌ This email is already registered. Please use a different email.');
        } else {
          setError('❌ Error adding student. Roll number may already exist.');
        }
      });
  };

  return (
    <div className="card">
      <h2>➕ Add New Student</h2>
      <br />
      {message && <p className="success-msg">{message}</p>}
      {error   && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit}>

        {/* ── Photo Upload (REQUIRED) ── */}
        <div className="form-section-title">📷 Student Photo <span style={{ color: 'red' }}>*</span></div>
        <div className="photo-upload-area">
          {preview
            ? <img src={preview} alt="Preview" className="photo-preview" />
            : <div className="photo-placeholder">No Photo</div>
          }
          <input type="file" accept="image/*" onChange={handlePhoto} style={{ marginTop: '10px' }} />
          {photoError && <p className="error-msg" style={{ marginTop: '5px' }}>{photoError}</p>}
          <small style={{ color: '#999' }}>Required | Max 2MB | JPG, PNG, GIF</small>
        </div>

        {/* ── Basic Info ── */}
        <div className="form-section-title">👤 Basic Information</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name: *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Prachi Sharma" />
          </div>
          <div className="form-group">
            <label>Roll Number: *</label>
            <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required placeholder="e.g. MCA2024001" />
          </div>
          <div className="form-group">
            <label>Email: * <small style={{ color: '#999' }}>(must be unique)</small></label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="e.g. prachi@gmail.com" />
          </div>
          <div className="form-group">
            <label>Course: *</label>
            <input type="text" name="course" value={formData.course} onChange={handleChange} required placeholder="e.g. MCA, BCA, B.Tech" />
          </div>
          <div className="form-group">
            <label>Date of Birth: *</label>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Gender: *</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required className="filter-select" style={{ width: '100%', padding: '10px' }}>
              <option value="">-- Select Gender --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Phone: *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="e.g. 9876543210" />
          </div>
          <div className="form-group">
            <label>Address:</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="e.g. 12 Main Street, Delhi" />
          </div>
        </div>

        {/* ── Guardian Info ── */}
        <div className="form-section-title">👨‍👩‍👧 Guardian Information</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Guardian Name:</label>
            <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} placeholder="e.g. Rajesh Sharma" />
          </div>
          <div className="form-group">
            <label>Guardian Phone:</label>
            <input type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} placeholder="e.g. 9876543210" />
          </div>
        </div>

        <button type="submit" className="btn-primary">Add Student & Generate ID Card</button>
        <button type="button" style={{ marginLeft: '10px', backgroundColor: '#95a5a6', color: 'white' }} onClick={() => navigate('/')}>Cancel</button>
      </form>

      {/* ── Show ID Card after student added ── */}
      {newStudent && (
        <IDCard
          student={newStudent}
          onClose={() => { setNewStudent(null); navigate('/'); }}
        />
      )}
    </div>
  );
}

export default AddStudent;

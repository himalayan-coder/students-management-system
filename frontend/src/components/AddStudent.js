import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import IDCard from './IDCard';

// Predefined courses — admin can type custom too
const PRESET_COURSES = ['BCA', 'MCA', 'B.Tech', 'M.Tech', 'BBA', 'MBA', 'B.Sc', 'M.Sc', 'B.Com', 'M.Com'];

function AddStudent() {
  const [step,        setStep]        = useState(1); // Step 1: Select course | Step 2: Fill form
  const [selectedCourse, setSelectedCourse] = useState('');
  const [customCourse,   setCustomCourse]   = useState('');
  const [formData,    setFormData]    = useState({
    name: '', rollNumber: '', email: '', course: '',
    dateOfBirth: '', gender: '', phone: '', address: '',
    guardianName: '', guardianPhone: ''
  });
  const [photo,       setPhoto]       = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [photoError,  setPhotoError]  = useState('');
  const [message,     setMessage]     = useState('');
  const [error,       setError]       = useState('');
  const [newStudent,  setNewStudent]  = useState(null);
  const [loadingRoll, setLoadingRoll] = useState(false);
  const navigate = useNavigate();

  // When course is confirmed, fetch next roll number
  const handleCourseConfirm = async () => {
    const course = selectedCourse === 'Other' ? customCourse.trim() : selectedCourse;
    if (!course) { setError('Please select or enter a course.'); return; }
    setError('');
    setLoadingRoll(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/students/next-roll/${encodeURIComponent(course)}`);
      setFormData((prev) => ({ ...prev, course, rollNumber: res.data.nextRoll }));
      setStep(2);
    } catch (err) {
      setError('Error fetching roll number. Please try again.');
    }
    setLoadingRoll(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) { setPhoto(file); setPreview(URL.createObjectURL(file)); setPhotoError(''); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    if (!photo) { setPhotoError('⚠️ Student photo is required!'); return; }

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    data.append('photo', photo);

    axios.post('http://localhost:5000/api/students', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then((res) => {
        setMessage('✅ Student added successfully! ID Card is ready.');
        setNewStudent(res.data);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || '';
        if (msg.toLowerCase().includes('email')) {
          setError('❌ This email is already registered. Use a different email.');
        } else if (msg.toLowerCase().includes('roll')) {
          setError(`❌ ${msg}`);
        } else {
          setError('❌ Error adding student. Please try again.');
        }
      });
  };

  // ── Step 1: Course Selection ─────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2>➕ Add New Student</h2>
        <br />
        <div className="form-section-title">📚 Step 1: Select Course</div>
        <br />
        {error && <p className="error-msg">{error}</p>}

        <div className="form-group">
          <label>Select Course: *</label>
          <select
            value={selectedCourse}
            onChange={(e) => { setSelectedCourse(e.target.value); setError(''); }}
            className="filter-select"
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
          >
            <option value="">-- Select a Course --</option>
            {PRESET_COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
            <option value="Other">Other (type manually)</option>
          </select>
        </div>

        {selectedCourse === 'Other' && (
          <div className="form-group">
            <label>Enter Course Name: *</label>
            <input
              type="text"
              value={customCourse}
              onChange={(e) => setCustomCourse(e.target.value)}
              placeholder="e.g. B.Pharmacy, LLB..."
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '15px' }}
            />
          </div>
        )}

        <div style={{ marginTop: '10px', padding: '12px', backgroundColor: '#f0f8ff', borderRadius: '8px', border: '1px solid #d6eaf8', fontSize: '13px', color: '#2980b9' }}>
          ℹ️ Roll number will be <strong>automatically assigned</strong> based on the last student enrolled in the selected course.
        </div>
        <br />
        <button
          className="btn-primary"
          onClick={handleCourseConfirm}
          disabled={loadingRoll}
          style={{ width: '100%', padding: '12px', fontSize: '16px' }}
        >
          {loadingRoll ? '⏳ Loading...' : `Next → Fill Student Details`}
        </button>
        <button
          type="button"
          style={{ width: '100%', marginTop: '10px', backgroundColor: '#95a5a6', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '15px' }}
          onClick={() => navigate('/')}
        >Cancel</button>
      </div>
    );
  }

  // ── Step 2: Student Form ─────────────────────────────────────────────────
  return (
    <div className="card">
      {/* Course + Roll No banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2>➕ Add New Student</h2>
        <button
          type="button"
          onClick={() => { setStep(1); setError(''); setMessage(''); }}
          style={{ backgroundColor: '#ecf0f1', color: '#2c3e50', border: '1px solid #ccc', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}
        >← Change Course</button>
      </div>

      {/* Course & Roll No Info Bar */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <div className="info-badge-bar">
          📚 Course: <strong>{formData.course}</strong>
        </div>
        <div className="info-badge-bar">
          🔢 Auto Roll No: <strong>#{formData.rollNumber}</strong>
        </div>
      </div>

      {message && <p className="success-msg">{message}</p>}
      {error   && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Photo */}
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

        {/* Basic Info */}
        <div className="form-section-title">👤 Basic Information</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name: *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Prachi Sharma" />
          </div>
          <div className="form-group">
            <label>Roll Number: <span style={{ color: '#27ae60', fontSize: '12px' }}>✓ Auto-assigned (editable)</span></label>
            <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email: * <small style={{ color: '#999' }}>(must be unique)</small></label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="e.g. prachi@gmail.com" />
          </div>
          <div className="form-group">
            <label>Course:</label>
            <input type="text" name="course" value={formData.course} readOnly style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }} />
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

        {/* Guardian */}
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
        <button type="button" style={{ marginLeft: '10px', backgroundColor: '#95a5a6', color: 'white' }} onClick={() => setStep(1)}>← Back</button>
      </form>

      {newStudent && (
        <IDCard student={newStudent} onClose={() => { setNewStudent(null); navigate('/'); }} />
      )}
    </div>
  );
}

export default AddStudent;

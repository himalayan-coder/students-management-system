import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required.';
  if (!/^\d{10}$/.test(phone)) return 'Phone number must be exactly 10 digits.';
  return '';
};

const validateDOB = (dob) => {
  if (!dob) return 'Date of birth is required.';
  const today   = new Date();
  const dobDate = new Date(dob);
  const minDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
  if (dobDate > minDate) return 'Student must be at least 12 years old.';
  return '';
};

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', rollNumber: '', email: '', course: '',
    dateOfBirth: '', gender: '', phone: '', address: '',
    guardianName: '', guardianPhone: ''
  });
  const [photo,         setPhoto]         = useState(null);
  const [preview,       setPreview]       = useState(null);
  const [existingPhoto, setExistingPhoto] = useState('');
  const [fieldErrors,   setFieldErrors]   = useState({});
  const [message,       setMessage]       = useState('');
  const [error,         setError]         = useState('');

  const maxDOB = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 12);
    return d.toISOString().split('T')[0];
  })();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/students/${id}`)
      .then((res) => {
        const s = res.data;
        setFormData({
          name: s.name, rollNumber: s.rollNumber, email: s.email,
          course: s.course, dateOfBirth: s.dateOfBirth || '',
          gender: s.gender || '', phone: s.phone || '',
          address: s.address || '', guardianName: s.guardianName || '',
          guardianPhone: s.guardianPhone || ''
        });
        if (s.photo) setExistingPhoto(s.photo);
      })
      .catch((err) => console.log('Error:', err));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    let err = '';
    if (name === 'phone')       err = validatePhone(value);
    if (name === 'dateOfBirth') err = validateDOB(value);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) { setPhoto(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(''); setError('');

    const phoneErr = validatePhone(formData.phone);
    const dobErr   = validateDOB(formData.dateOfBirth);
    setFieldErrors({ phone: phoneErr, dateOfBirth: dobErr });
    if (phoneErr || dobErr) return;

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (photo) data.append('photo', photo);

    axios.put(`http://localhost:5000/api/students/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(() => { setMessage('✅ Student updated successfully!'); setTimeout(() => navigate('/'), 1500); })
      .catch((err) => {
        const msg = err.response?.data?.message || '';
        if (msg.toLowerCase().includes('email')) setError('❌ Email already registered.');
        else setError('❌ Error updating student.');
      });
  };

  return (
    <div className="card">
      <h2>✏️ Edit Student</h2><br />
      {message && <p className="success-msg">{message}</p>}
      {error   && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit}>

        {/* Photo */}
        <div className="form-section-title">📷 Student Photo</div>
        <div className="photo-upload-area">
          {preview
            ? <img src={preview} alt="New" className="photo-preview" />
            : existingPhoto
              ? <img src={`http://localhost:5000/uploads/${existingPhoto}`} alt="Current" className="photo-preview" />
              : <div className="photo-placeholder">No Photo</div>}
          <input type="file" accept="image/*" onChange={handlePhoto} style={{ marginTop: '10px' }} />
          {existingPhoto && !preview && <small style={{ color: '#27ae60' }}>✓ Current photo loaded</small>}
        </div>

        {/* Basic Info */}
        <div className="form-section-title">👤 Basic Information</div>
        <div className="form-grid">

          <div className="form-group">
            <label>Full Name: *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Roll Number: *</label>
            <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email: *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Course:</label>
            <input type="text" name="course" value={formData.course} readOnly
              style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }} />
          </div>

          {/* DOB with validation */}
          <div className="form-group">
            <label>Date of Birth: * <small style={{ color: '#999' }}>(must be 12+ years old)</small></label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              max={maxDOB}
              required
              className={fieldErrors.dateOfBirth ? 'input-error' : ''}
            />
            {fieldErrors.dateOfBirth && <p className="field-error-msg">⚠️ {fieldErrors.dateOfBirth}</p>}
          </div>

          <div className="form-group">
            <label>Gender: *</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required
              className="filter-select" style={{ width: '100%', padding: '10px' }}>
              <option value="">-- Select Gender --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Phone with validation */}
          <div className="form-group">
            <label>Phone: * <small style={{ color: '#999' }}>(10 digits only)</small></label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                handleChange({ target: { name: 'phone', value: val } });
              }}
              maxLength={10}
              required
              className={fieldErrors.phone ? 'input-error' : ''}
            />
            <small style={{ color: formData.phone.length === 10 ? '#27ae60' : '#e67e22', fontWeight: 'bold' }}>
              {formData.phone.length}/10 digits{formData.phone.length === 10 ? ' ✓' : ''}
            </small>
            {fieldErrors.phone && <p className="field-error-msg">⚠️ {fieldErrors.phone}</p>}
          </div>

          <div className="form-group">
            <label>Address:</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} />
          </div>

        </div>

        {/* Guardian */}
        <div className="form-section-title">👨‍👩‍👧 Guardian Information</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Guardian Name:</label>
            <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Guardian Phone:</label>
            <input
              type="tel"
              name="guardianPhone"
              value={formData.guardianPhone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData((prev) => ({ ...prev, guardianPhone: val }));
              }}
              maxLength={10}
            />
            {formData.guardianPhone.length > 0 && (
              <small style={{ color: formData.guardianPhone.length === 10 ? '#27ae60' : '#e67e22', fontWeight: 'bold' }}>
                {formData.guardianPhone.length}/10 digits{formData.guardianPhone.length === 10 ? ' ✓' : ''}
              </small>
            )}
          </div>
        </div>

        <button type="submit" className="btn-primary">Update Student</button>
        <button type="button"
          style={{ marginLeft: '10px', backgroundColor: '#95a5a6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          onClick={() => navigate('/')}>Cancel</button>
      </form>
    </div>
  );
}

export default EditStudent;

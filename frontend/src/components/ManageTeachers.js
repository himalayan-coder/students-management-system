import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ManageTeachers() {
  const [teachers,     setTeachers]     = useState([]);
  // Add form state
  const [name,         setName]         = useState('');
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [role,         setRole]         = useState('teacher');
  const [photo,        setPhoto]        = useState(null);
  const [preview,      setPreview]      = useState(null);
  // Edit state
  const [editMode,     setEditMode]     = useState(false);
  const [editId,       setEditId]       = useState(null);
  const [editName,     setEditName]     = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole,     setEditRole]     = useState('teacher');
  const [editPhoto,    setEditPhoto]    = useState(null);
  const [editPreview,  setEditPreview]  = useState(null);
  const [editExisting, setEditExisting] = useState('');

  const [message, setMessage] = useState('');
  const [error,   setError]   = useState('');

  const navigate    = useNavigate();
  const currentRole = localStorage.getItem('teacherRole');

  useEffect(() => {
    if (currentRole !== 'admin') navigate('/');
    else fetchTeachers();
  }, []);

  const fetchTeachers = () => {
    axios.get('http://localhost:5000/api/auth/teachers')
      .then((res) => setTeachers(res.data))
      .catch((err) => console.log('Error:', err));
  };

  // ── Add Teacher ──────────────────────────────────────────────────────────
  const handleRegister = (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    const data = new FormData();
    data.append('name', name); data.append('username', username);
    data.append('password', password); data.append('role', role);
    if (photo) data.append('photo', photo);

    axios.post('http://localhost:5000/api/auth/register', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => {
        setMessage(`Teacher "${name}" registered successfully!`);
        setName(''); setUsername(''); setPassword(''); setRole('teacher'); setPhoto(null); setPreview(null);
        fetchTeachers();
      })
      .catch((err) => setError(err.response?.data?.message || 'Error registering teacher.'));
  };

  // ── Open Edit Modal ──────────────────────────────────────────────────────
  const openEdit = (t) => {
    setEditMode(true); setEditId(t._id);
    setEditName(t.name); setEditUsername(t.username);
    setEditRole(t.role); setEditPassword('');
    setEditExisting(t.photo || ''); setEditPreview(null); setEditPhoto(null);
    setMessage(''); setError('');
  };

  // ── Save Edit ────────────────────────────────────────────────────────────
  const handleEdit = (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    const data = new FormData();
    data.append('name', editName); data.append('username', editUsername);
    data.append('role', editRole);
    if (editPassword.trim()) data.append('password', editPassword);
    if (editPhoto) data.append('photo', editPhoto);

    axios.put(`http://localhost:5000/api/auth/teachers/${editId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(() => {
        setMessage(`Teacher "${editName}" updated successfully!`);
        setEditMode(false); fetchTeachers();
      })
      .catch((err) => setError(err.response?.data?.message || 'Error updating teacher.'));
  };

  // ── Delete Teacher ───────────────────────────────────────────────────────
  const handleDelete = (id, tname) => {
    if (window.confirm(`Delete teacher "${tname}"?`)) {
      axios.delete(`http://localhost:5000/api/auth/teachers/${id}`)
        .then(() => { setMessage(`Teacher "${tname}" deleted.`); fetchTeachers(); })
        .catch((err) => console.log('Error:', err));
    }
  };

  return (
    <div>
      {/* ── Add Teacher Form ── */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2>➕ Add New Teacher</h2><br />
        {message && <p className="success-msg">{message}</p>}
        {error   && <p className="error-msg">{error}</p>}

        <form onSubmit={handleRegister}>
          <div className="form-section-title">📷 Teacher Photo</div>
          <div className="photo-upload-area">
            {preview
              ? <img src={preview} alt="Preview" className="photo-preview" />
              : <div className="photo-placeholder">No Photo</div>
            }
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setPhoto(f); setPreview(URL.createObjectURL(f)); } }} style={{ marginTop: '8px' }} />
          </div>

          <div className="form-section-title">👤 Teacher Details</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name: *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Ramesh Kumar" />
            </div>
            <div className="form-group">
              <label>Username: *</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="e.g. ramesh123" />
            </div>
            <div className="form-group">
              <label>Password: *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min 6 characters" />
            </div>
            <div className="form-group">
              <label>Role:</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="filter-select" style={{ width: '100%', padding: '10px' }}>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">Register Teacher</button>
        </form>
      </div>

      {/* ── Edit Teacher Modal ── */}
      {editMode && (
        <div className="id-modal-overlay" onClick={() => setEditMode(false)}>
          <div className="id-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>✏️ Edit Teacher</h3>
            {error && <p className="error-msg">{error}</p>}
            <form onSubmit={handleEdit}>
              <div className="photo-upload-area" style={{ marginBottom: '15px' }}>
                {editPreview
                  ? <img src={editPreview} alt="New" className="photo-preview" />
                  : editExisting
                    ? <img src={`http://localhost:5000/uploads/${editExisting}`} alt="Current" className="photo-preview" />
                    : <div className="photo-placeholder">No Photo</div>
                }
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setEditPhoto(f); setEditPreview(URL.createObjectURL(f)); } }} style={{ marginTop: '8px' }} />
              </div>
              <div className="form-group"><label>Full Name: *</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required /></div>
              <div className="form-group"><label>Username: *</label><input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} required /></div>
              <div className="form-group"><label>New Password: <small style={{ color: '#999' }}>(leave blank to keep current)</small></label><input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Enter new password" /></div>
              <div className="form-group">
                <label>Role:</label>
                <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="filter-select" style={{ width: '100%', padding: '10px' }}>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary">Save Changes</button>
                <button type="button" style={{ backgroundColor: '#95a5a6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── All Teachers Table ── */}
      <div className="card">
        <h2>👥 All Teachers ({teachers.length})</h2><br />
        {teachers.length === 0 ? <p>No teachers found.</p> : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t, i) => (
                <tr key={t._id}>
                  <td>{i + 1}</td>
                  <td>
                    {t.photo
                      ? <img src={`http://localhost:5000/uploads/${t.photo}`} alt={t.name} className="student-thumb" />
                      : <div className="no-photo">N/A</div>
                    }
                  </td>
                  <td><strong>{t.name}</strong></td>
                  <td>{t.username}</td>
                  <td><span className={`role-badge role-${t.role}`}>{t.role}</span></td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-edit" style={{ marginRight: '6px' }} onClick={() => openEdit(t)}>Edit</button>
                    {t.username !== 'admin'
                      ? <button className="btn-delete" onClick={() => handleDelete(t._id, t.name)}>Delete</button>
                      : <span style={{ color: '#999', fontSize: '12px' }}>Protected</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageTeachers;

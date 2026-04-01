import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

function StudentList() {
  const [students,     setStudents]     = useState([]);
  const [activeCourse, setActiveCourse] = useState('All');
  const [searchTerm,   setSearchTerm]   = useState('');
  const [filterGender, setFilterGender] = useState('All');
  const [sortField,    setSortField]    = useState('rollNumber');
  const [sortOrder,    setSortOrder]    = useState('asc');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [message,      setMessage]      = useState('');
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

  const calcAge = (dob) => {
    if (!dob) return '—';
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  };

  // All unique courses for tabs
  const courses = ['All', ...new Set(students.map((s) => s.course).filter(Boolean).sort())];

  const handleSort = (field) => {
    setSortField(field);
    setSortOrder(sortField === field && sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };
  const arrow = (f) => sortField === f ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ' ↕';

  // Filter
  const filtered = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      (activeCourse === 'All' || s.course === activeCourse) &&
      (filterGender === 'All' || s.gender === filterGender) &&
      (s.name.toLowerCase().includes(term) ||
       s.rollNumber.toString().includes(term) ||
       s.course.toLowerCase().includes(term) ||
       (s.email || '').toLowerCase().includes(term))
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let vA = sortField === 'age'        ? calcAge(a.dateOfBirth)
           : sortField === 'rollNumber' ? parseInt(a.rollNumber) || 0
           : (a[sortField] || '');
    let vB = sortField === 'age'        ? calcAge(b.dateOfBirth)
           : sortField === 'rollNumber' ? parseInt(b.rollNumber) || 0
           : (b[sortField] || '');
    if (typeof vA === 'string') vA = vA.toLowerCase();
    if (typeof vB === 'string') vB = vB.toLowerCase();
    if (vA < vB) return sortOrder === 'asc' ? -1 : 1;
    if (vA > vB) return sortOrder === 'asc' ?  1 : -1;
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated  = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSearchTerm(''); setFilterGender('All');
    setSortField('rollNumber'); setSortOrder('asc'); setCurrentPage(1);
  };

  return (
    <div>
      {/* ── Course Tabs ── */}
      <div className="course-tabs">
        {courses.map((c) => (
          <button
            key={c}
            className={`course-tab ${activeCourse === c ? 'course-tab-active' : ''}`}
            onClick={() => { setActiveCourse(c); setCurrentPage(1); resetFilters(); }}
          >
            {c === 'All' ? '📋 All Students' : `📚 ${c}`}
            <span className="tab-count">
              {c === 'All' ? students.length : students.filter((s) => s.course === c).length}
            </span>
          </button>
        ))}
      </div>

      <div className="card">
        {/* Header + Search */}
        <div className="list-header">
          <h2>{activeCourse === 'All' ? '📋 All Students' : `📚 ${activeCourse}`}</h2>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, roll no, email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="search-input"
            />
            {searchTerm && <button className="clear-search" onClick={() => { setSearchTerm(''); setCurrentPage(1); }}>✕</button>}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-group">
            <label>⚧ Gender:</label>
            <select value={filterGender} onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }} className="filter-select">
              {['All','Male','Female','Other'].map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <button className="btn-reset" onClick={resetFilters}>🔄 Reset</button>
        </div>

        {message && <p className="success-msg">{message}</p>}
        <p className="student-count">
          Showing <strong>{paginated.length}</strong> of <strong>{sorted.length}</strong> student(s)
          {activeCourse !== 'All' && ` in ${activeCourse}`}
        </p>

        {students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p style={{ fontSize: '40px' }}>🎓</p>
            <p>No students yet. <a href="/add" style={{ color: '#3498db' }}>Add the first student!</a></p>
          </div>
        ) : sorted.length === 0 ? (
          <p className="error-msg">No students found matching your search.</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Photo</th>
                  <th className="sortable" onClick={() => handleSort('name')}>Name{arrow('name')}</th>
                  <th className="sortable" onClick={() => handleSort('rollNumber')}>Roll No{arrow('rollNumber')}</th>
                  <th>Email</th>
                  {activeCourse === 'All' && <th className="sortable" onClick={() => handleSort('course')}>Course{arrow('course')}</th>}
                  <th className="sortable" onClick={() => handleSort('gender')}>Gender{arrow('gender')}</th>
                  <th className="sortable" onClick={() => handleSort('age')}>Age{arrow('age')}</th>
                  <th>Phone</th>
                  <th>Guardian</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s, i) => (
                  <tr key={s._id}>
                    <td>{startIndex + i + 1}</td>
                    <td>
                      {s.photo
                        ? <img src={`http://localhost:5000/uploads/${s.photo}`} alt={s.name} className="student-thumb" />
                        : <div className="no-photo">N/A</div>
                      }
                    </td>
                    <td><strong>{s.name}</strong></td>
                    <td><span className="roll-badge">#{s.rollNumber}</span></td>
                    <td>{s.email}</td>
                    {activeCourse === 'All' && <td><span className="course-badge">{s.course}</span></td>}
                    <td><span className={`gender-badge gender-${(s.gender||'').toLowerCase()}`}>{s.gender || '—'}</span></td>
                    <td>{calcAge(s.dateOfBirth)}</td>
                    <td>{s.phone || '—'}</td>
                    <td style={{ fontSize: '12px' }}>{s.guardianName || '—'}</td>
                    <td>
                      <button className="btn-edit"   onClick={() => navigate(`/edit/${s._id}`)}>Edit</button>
                      <button className="btn-delete" onClick={() => deleteStudent(s._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" onClick={() => setCurrentPage(1)}             disabled={currentPage === 1}>« First</button>
                <button className="page-btn" onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>‹ Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`page-btn ${currentPage === p ? 'active-page' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
                ))}
                <button className="page-btn" onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>Next ›</button>
                <button className="page-btn" onClick={() => setCurrentPage(totalPages)}   disabled={currentPage === totalPages}>Last »</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default StudentList;

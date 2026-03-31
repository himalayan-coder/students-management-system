import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 5;

function StudentList() {
  const [students,     setStudents]     = useState([]);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterGender, setFilterGender] = useState('All');
  const [minAge,       setMinAge]       = useState('');
  const [maxAge,       setMaxAge]       = useState('');
  const [sortField,    setSortField]    = useState('name');
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

  // Calculate age from date of birth
  const calcAge = (dob) => {
    if (!dob) return '—';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const uniqueCourses = ['All', ...new Set(students.map((s) => s.course))];

  const handleSort = (field) => {
    setSortField(field);
    setSortOrder(sortField === field && sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };
  const arrow = (f) => sortField === f ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ' ↕';

  const filtered = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const age  = calcAge(s.dateOfBirth);
    return (
      (s.name.toLowerCase().includes(term) || s.rollNumber.toLowerCase().includes(term) || s.course.toLowerCase().includes(term)) &&
      (filterCourse === 'All' || s.course === filterCourse) &&
      (filterGender === 'All' || s.gender === filterGender) &&
      (minAge === '' || age >= parseInt(minAge)) &&
      (maxAge === '' || age <= parseInt(maxAge))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let vA = sortField === 'age' ? calcAge(a.dateOfBirth) : (a[sortField] || '');
    let vB = sortField === 'age' ? calcAge(b.dateOfBirth) : (b[sortField] || '');
    if (typeof vA === 'string') vA = vA.toLowerCase();
    if (typeof vB === 'string') vB = vB.toLowerCase();
    if (vA < vB) return sortOrder === 'asc' ? -1 : 1;
    if (vA > vB) return sortOrder === 'asc' ?  1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated  = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSearchTerm(''); setFilterCourse('All'); setFilterGender('All');
    setMinAge(''); setMaxAge(''); setSortField('name'); setSortOrder('asc'); setCurrentPage(1);
  };

  return (
    <div className="card">
      {/* Header + Search */}
      <div className="list-header">
        <h2>All Students</h2>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search by name, roll number or course..." value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="search-input" />
          {searchTerm && <button className="clear-search" onClick={() => { setSearchTerm(''); setCurrentPage(1); }}>✕</button>}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>📚 Course:</label>
          <select value={filterCourse} onChange={(e) => { setFilterCourse(e.target.value); setCurrentPage(1); }} className="filter-select">
            {uniqueCourses.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>⚧ Gender:</label>
          <select value={filterGender} onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }} className="filter-select">
            {['All','Male','Female','Other'].map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>🎂 Age:</label>
          <input type="number" placeholder="Min" value={minAge} onChange={(e) => { setMinAge(e.target.value); setCurrentPage(1); }} className="age-input" />
          <span style={{ margin: '0 5px', color: '#777' }}>–</span>
          <input type="number" placeholder="Max" value={maxAge} onChange={(e) => { setMaxAge(e.target.value); setCurrentPage(1); }} className="age-input" />
        </div>
        <button className="btn-reset" onClick={resetFilters}>🔄 Reset</button>
      </div>

      {message && <p className="success-msg">{message}</p>}
      <p className="student-count">Showing <strong>{paginated.length}</strong> of <strong>{sorted.length}</strong> student(s)</p>

      {students.length === 0 ? (
        <p>No students found. Please add a student.</p>
      ) : sorted.length === 0 ? (
        <p className="error-msg">No students found matching your filters.</p>
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
                <th className="sortable" onClick={() => handleSort('course')}>Course{arrow('course')}</th>
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
                  <td>{s.rollNumber}</td>
                  <td>{s.email}</td>
                  <td><span className="course-badge">{s.course}</span></td>
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
  );
}

export default StudentList;

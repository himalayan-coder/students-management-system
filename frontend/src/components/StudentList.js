// StudentList.js - With Search, Filter by Course, Age Range, Sort Columns, Pagination

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 5; // Students per page

function StudentList() {
  const [students,    setStudents]    = useState([]);
  const [searchTerm,  setSearchTerm]  = useState('');
  const [filterCourse,setFilterCourse]= useState('All');
  const [minAge,      setMinAge]      = useState('');
  const [maxAge,      setMaxAge]      = useState('');
  const [sortField,   setSortField]   = useState('name');
  const [sortOrder,   setSortOrder]   = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [message,     setMessage]     = useState('');

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

  // Get unique courses for dropdown
  const uniqueCourses = ['All', ...new Set(students.map((s) => s.course))];

  // Handle column sort toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Sort arrow indicator
  const sortArrow = (field) => {
    if (sortField !== field) return ' ↕';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  // Apply Search + Filter + Age Range
  const filtered = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(term) ||
      s.rollNumber.toLowerCase().includes(term) ||
      s.course.toLowerCase().includes(term);

    const matchCourse = filterCourse === 'All' || s.course === filterCourse;

    const matchAge =
      (minAge === '' || s.age >= parseInt(minAge)) &&
      (maxAge === '' || s.age <= parseInt(maxAge));

    return matchSearch && matchCourse && matchAge;
  });

  // Apply Sort
  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ?  1 : -1;
    return 0;
  });

  // Apply Pagination
  const totalPages  = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const startIndex  = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated   = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page when filters change
  const handleSearchChange = (e) => { setSearchTerm(e.target.value);   setCurrentPage(1); };
  const handleCourseChange = (e) => { setFilterCourse(e.target.value); setCurrentPage(1); };
  const handleMinAge       = (e) => { setMinAge(e.target.value);       setCurrentPage(1); };
  const handleMaxAge       = (e) => { setMaxAge(e.target.value);       setCurrentPage(1); };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterCourse('All');
    setMinAge('');
    setMaxAge('');
    setSortField('name');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  return (
    <div className="card">

      {/* ===== HEADER ===== */}
      <div className="list-header">
        <h2>All Students</h2>
        {/* Search Box */}
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, roll number or course..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchTerm && <button className="clear-search" onClick={() => { setSearchTerm(''); setCurrentPage(1); }}>✕</button>}
        </div>
      </div>

      {/* ===== FILTER BAR ===== */}
      <div className="filter-bar">

        {/* Filter by Course */}
        <div className="filter-group">
          <label>📚 Course:</label>
          <select value={filterCourse} onChange={handleCourseChange} className="filter-select">
            {uniqueCourses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Filter by Age Range */}
        <div className="filter-group">
          <label>🎂 Age Range:</label>
          <input type="number" placeholder="Min" value={minAge} onChange={handleMinAge} className="age-input" min="1" />
          <span style={{ margin: '0 5px', color: '#777' }}>–</span>
          <input type="number" placeholder="Max" value={maxAge} onChange={handleMaxAge} className="age-input" min="1" />
        </div>

        {/* Reset Button */}
        <button className="btn-reset" onClick={resetFilters}>🔄 Reset</button>
      </div>

      {/* ===== MESSAGES & COUNT ===== */}
      {message && <p className="success-msg">{message}</p>}
      <p className="student-count">
        Showing <strong>{paginated.length}</strong> of <strong>{sorted.length}</strong> student(s)
        {filterCourse !== 'All' && ` in "${filterCourse}"`}
        {searchTerm && ` matching "${searchTerm}"`}
      </p>

      {/* ===== TABLE ===== */}
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
                <th className="sortable" onClick={() => handleSort('name')}>Name{sortArrow('name')}</th>
                <th className="sortable" onClick={() => handleSort('rollNumber')}>Roll Number{sortArrow('rollNumber')}</th>
                <th>Email</th>
                <th className="sortable" onClick={() => handleSort('course')}>Course{sortArrow('course')}</th>
                <th className="sortable" onClick={() => handleSort('age')}>Age{sortArrow('age')}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s, i) => (
                <tr key={s._id}>
                  <td>{startIndex + i + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.rollNumber}</td>
                  <td>{s.email}</td>
                  <td><span className="course-badge">{s.course}</span></td>
                  <td>{s.age}</td>
                  <td>
                    <button className="btn-edit"   onClick={() => navigate(`/edit/${s._id}`)}>Edit</button>
                    <button className="btn-delete" onClick={() => deleteStudent(s._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ===== PAGINATION ===== */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >« First</button>

              <button
                className="page-btn"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >‹ Prev</button>

              {/* Page number buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? 'active-page' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >{page}</button>
              ))}

              <button
                className="page-btn"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >Next ›</button>

              <button
                className="page-btn"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >Last »</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StudentList;

// IDCard.js - Auto-generated Student ID Card with PDF download

import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function IDCard({ student, onClose }) {
  const cardRef = useRef();

  const calcAge = (dob) => {
    if (!dob) return '—';
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  };

  const downloadPDF = async () => {
    const canvas  = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [85.6, 54] }); // Credit card size
    pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
    pdf.save(`ID_Card_${student.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="id-modal-overlay" onClick={onClose}>
      <div className="id-modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#2c3e50' }}>🪪 Student ID Card</h3>

        {/* ── ID Card Design ── */}
        <div ref={cardRef} className="id-card">
          {/* Header */}
          <div className="id-card-header">
            <div className="id-school-name">🎓 Student Management System</div>
            <div className="id-card-title">STUDENT IDENTITY CARD</div>
          </div>

          {/* Body */}
          <div className="id-card-body">
            {/* Photo */}
            <div className="id-photo-section">
              {student.photo
                ? <img src={`http://localhost:5000/uploads/${student.photo}`} alt={student.name} className="id-photo" crossOrigin="anonymous" />
                : <div className="id-no-photo">No Photo</div>
              }
            </div>

            {/* Info */}
            <div className="id-info-section">
              <div className="id-student-name">{student.name}</div>
              <div className="id-info-row"><span className="id-label">Roll No:</span> <span>{student.rollNumber}</span></div>
              <div className="id-info-row"><span className="id-label">Course:</span>  <span>{student.course}</span></div>
              <div className="id-info-row"><span className="id-label">Gender:</span>  <span>{student.gender || '—'}</span></div>
              <div className="id-info-row"><span className="id-label">DOB:</span>     <span>{student.dateOfBirth || '—'}</span></div>
              <div className="id-info-row"><span className="id-label">Age:</span>     <span>{calcAge(student.dateOfBirth)} yrs</span></div>
              <div className="id-info-row"><span className="id-label">Phone:</span>   <span>{student.phone || '—'}</span></div>
              <div className="id-info-row"><span className="id-label">Email:</span>   <span style={{ fontSize: '9px' }}>{student.email}</span></div>
            </div>
          </div>

          {/* Footer */}
          <div className="id-card-footer">
            <div>Guardian: {student.guardianName || '—'} | {student.guardianPhone || '—'}</div>
            <div>Issued: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
          <button className="btn-primary" onClick={downloadPDF}>⬇️ Download PDF</button>
          <button style={{ backgroundColor: '#95a5a6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default IDCard;

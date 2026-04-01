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
    const element = cardRef.current;

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width:  element.offsetWidth,
      height: element.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth:  element.offsetWidth,
      windowHeight: element.offsetHeight,
    });

    const imgData = canvas.toDataURL('image/png');

    // A6 size card (landscape): 148mm x 105mm
    const cardW = 148;
    const cardH = 105;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [cardW, cardH]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, cardW, cardH);
    pdf.save(`ID_Card_${student.name.replace(/\s+/g, '_')}.pdf`);
  };

  const calcAge2 = (dob) => {
    if (!dob) return '—';
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  };

  return (
    <div className="id-modal-overlay" onClick={onClose}>
      <div className="id-modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#2c3e50' }}>🪪 Student ID Card</h3>

        {/* ── ID Card (fixed full width) ── */}
        <div
          ref={cardRef}
          style={{
            width: '500px',
            border: '2px solid #2c3e50',
            borderRadius: '10px',
            overflow: 'hidden',
            fontFamily: 'Arial, sans-serif',
            margin: '0 auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            backgroundColor: '#fff'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #2c3e50, #3498db)',
            color: 'white',
            padding: '12px 16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              🎓 Student Management System
            </div>
            <div style={{ fontSize: '10px', opacity: '0.85', marginTop: '3px', letterSpacing: '1.5px' }}>
              STUDENT IDENTITY CARD
            </div>
          </div>

          {/* Body */}
          <div style={{ display: 'flex', padding: '16px', gap: '16px', backgroundColor: '#fff', alignItems: 'flex-start' }}>
            {/* Photo */}
            <div style={{ flexShrink: 0 }}>
              {student.photo
                ? <img
                    src={`http://localhost:5000/uploads/${student.photo}`}
                    alt={student.name}
                    crossOrigin="anonymous"
                    style={{ width: '100px', height: '115px', objectFit: 'cover', border: '2px solid #2c3e50', borderRadius: '6px' }}
                  />
                : <div style={{ width: '100px', height: '115px', background: '#eee', border: '2px solid #ccc', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#999' }}>
                    No Photo
                  </div>
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                {student.name}
              </div>
              {[
                ['Roll No',  student.rollNumber],
                ['Course',   student.course],
                ['Gender',   student.gender   || '—'],
                ['DOB',      student.dateOfBirth || '—'],
                ['Age',      calcAge2(student.dateOfBirth) + ' yrs'],
                ['Phone',    student.phone    || '—'],
                ['Email',    student.email],
              ].map(([label, value]) => (
                <div key={label} style={{ fontSize: '12px', color: '#444', marginBottom: '4px', display: 'flex', gap: '6px' }}>
                  <span style={{ fontWeight: 'bold', color: '#2c3e50', minWidth: '55px' }}>{label}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: '#2c3e50',
            color: 'white',
            padding: '8px 16px',
            fontSize: '11px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Guardian: {student.guardianName || '—'} | {student.guardianPhone || '—'}</span>
            <span>Issued: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '18px' }}>
          <button className="btn-primary" onClick={downloadPDF}>⬇️ Download PDF</button>
          <button
            style={{ backgroundColor: '#95a5a6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            onClick={onClose}
          >Close</button>
        </div>
      </div>
    </div>
  );
}

export default IDCard;

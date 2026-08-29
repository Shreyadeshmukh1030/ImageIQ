import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

const UploadZoneCard = ({ onFileSelected }) => {
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div 
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.5rem',
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '1px dashed rgba(255,255,255,0.2)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginTop: '1rem'
      }}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.borderColor = 'var(--primary-accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
      }}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        accept="image/jpeg, image/png, image/jpg" 
      />
      
      <div style={{ 
        width: '40px', height: '40px', 
        borderRadius: '8px', 
        backgroundColor: 'rgba(255,255,255,0.05)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}>
        <Upload size={20} color="white" />
      </div>
      
      <div>
        <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500' }}>
          Drag & drop an image here or click to upload
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          Supports: JPG, PNG, JPEG (Max size: 10MB)
        </div>
      </div>
    </div>
  );
};

export default UploadZoneCard;

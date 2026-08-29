import React from 'react';
import { UploadCloud, User, Sun } from 'lucide-react';

const TopNav = ({ onUploadClick }) => {
  return (
    <div className="top-nav">
      <div>
        <h1 className="text-h1" style={{ color: 'white', marginBottom: '0.25rem' }}>Analyze Image</h1>
        <p className="text-body" style={{ margin: 0 }}>Upload an image to analyze its quality and detect defects</p>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <Sun size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '20px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#5D5FEF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 'bold' }}>AU</div>
            <span style={{ fontSize: '0.875rem', color: 'white' }}>Admin User</span>
          </div>
        </div>
        <button className="btn-primary" onClick={onUploadClick}>
          <UploadCloud size={18} />
          Upload New Image
        </button>
      </div>
    </div>
  );
};

export default TopNav;

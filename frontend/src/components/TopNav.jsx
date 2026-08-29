import React from 'react';
import { UploadCloud, User, Sun } from 'lucide-react';

const TopNav = ({ onUploadClick }) => {
  return (
    <div className="top-nav">
      <div>
        <h1 className="text-h1" style={{ color: 'white', marginBottom: '0.25rem' }}>Analyze Image</h1>
        <p className="text-body" style={{ margin: 0 }}>Upload an image to analyze its quality and detect defects</p>
      </div>
      <div>
        <button className="btn-primary" onClick={onUploadClick}>
          <UploadCloud size={18} />
          Upload New Image
        </button>
      </div>
    </div>
  );
};

export default TopNav;

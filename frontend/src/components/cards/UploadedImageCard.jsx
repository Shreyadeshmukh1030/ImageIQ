import React from 'react';

const UploadedImageCard = ({ imageUrl }) => {
  return (
    <div className="card card-uploaded-image" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <h3 className="text-h3" style={{ color: 'white', margin: 0 }}>Uploaded Image</h3>
        <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-green)', padding: '2px 6px', borderRadius: '4px' }}>.jpg</span>
      </div>
      
      <div style={{ 
        flexGrow: 1, 
        backgroundColor: '#000', 
        borderRadius: '8px', 
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
      }}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Uploaded" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <p className="text-muted">No image uploaded</p>
        )}
      </div>
    </div>
  );
};

export default UploadedImageCard;

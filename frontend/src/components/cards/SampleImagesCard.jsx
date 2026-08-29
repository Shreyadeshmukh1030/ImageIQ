import React from 'react';

const SampleImagesCard = ({ onFileSelected }) => {
  const sampleImages = [
    '10004473376.jpg',
    '10007357496.jpg',
    '10007903636.jpg',
    '10009096245.jpg',
    '100117038.jpg',
    '10012398043.jpg',
    '10013822223.jpg',
    '10014002683.jpg',
    '10017119924.jpg',
    '10020766793.jpg'
  ];

  const handleImageClick = async (filename) => {
    try {
      const response = await fetch(`/samples/${filename}`);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });
      onFileSelected(file);
    } catch (error) {
      console.error('Error loading sample image:', error);
    }
  };

  return (
    <div className="card card-sample-images" style={{ gridColumn: '1 / -1' }}>
      <h3 className="text-h3" style={{ color: 'white', marginBottom: '1.25rem' }}>Try a Sample Image</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
        gap: '1rem' 
      }}>
        {sampleImages.map((filename, idx) => (
          <div 
            key={idx} 
            style={{ 
              cursor: 'pointer',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid transparent',
              transition: 'border-color 0.2s ease',
              aspectRatio: '4/3'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            onClick={() => handleImageClick(filename)}
          >
            <img 
              src={`/samples/${filename}`} 
              alt={`Sample ${idx + 1}`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SampleImagesCard;

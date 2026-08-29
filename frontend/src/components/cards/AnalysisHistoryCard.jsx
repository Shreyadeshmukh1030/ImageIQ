import React from 'react';

const AnalysisHistoryCard = ({ history }) => {
  // Use mock history if none provided
  const items = history && history.length > 0 ? history : [
    { filename: 'mountain_lake.jpg', date: 'May 22, 2024 10:30 AM', score: 78.4, status: 'DEGRADED', color: 'var(--status-yellow)' },
    { filename: 'city_skyline.png', date: 'May 22, 2024 09:15 AM', score: 92.1, status: 'ACCEPTABLE', color: 'var(--status-green)' },
    { filename: 'dark_photo.jpg', date: 'May 21, 2024 04:45 PM', score: 32.8, status: 'DEFECTIVE', color: 'var(--status-red)' },
    { filename: 'flowers.jpg', date: 'May 21, 2024 03:20 PM', score: 85.6, status: 'ACCEPTABLE', color: 'var(--status-green)' },
  ];

  return (
    <div className="card card-analysis-history" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexShrink: 0 }}>
        <h3 className="text-h3" style={{ color: 'white', margin: 0 }}>Analysis History</h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--primary-accent)', cursor: 'pointer', fontWeight: '500' }}>View All</span>
      </div>
      
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '36px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
               {/* Use a placeholder gradient if no thumbnail is available */}
               <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #1f2937, #374151)' }} />
            </div>
            
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.filename}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                {item.date}
              </div>
            </div>
            
            <div style={{ 
              border: `1px solid ${item.color}`, 
              color: item.color, 
              padding: '2px 8px', 
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {item.score?.toFixed(1)}
            </div>
            
            <div style={{ 
              color: item.color, 
              fontSize: '0.75rem', 
              fontWeight: '600',
              width: '70px',
              textAlign: 'right'
            }}>
              {item.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisHistoryCard;

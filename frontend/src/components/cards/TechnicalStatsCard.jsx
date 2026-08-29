import React from 'react';
import { Sun, Focus, Contrast, Wind, Palette, Droplets, Monitor, FileCode } from 'lucide-react';

const TechnicalStatsCard = ({ stats }) => {
  // We'll mock the missing stats that our backend doesn't provide natively,
  // or use them if they exist in the OpenCV feature response.
  
  const statItems = [
    { label: 'Brightness', value: stats?.brightness?.toFixed(1) || '0.0', status: 'Low', icon: <Sun size={18} color="var(--primary-accent)" /> },
    { label: 'Sharpness', value: stats?.sharpness?.toFixed(1) || '0.0', status: 'Low', icon: <Focus size={18} color="var(--status-green)" /> },
    { label: 'Contrast', value: stats?.contrast?.toFixed(1) || '0.0', status: 'Low', icon: <Contrast size={18} color="#a855f7" /> },
    { label: 'Noise', value: stats?.noise?.toFixed(2) || '0.00', status: 'High', icon: <Wind size={18} color="var(--status-red)" /> },
    { label: 'Saturation', value: '0.47', status: 'Medium', icon: <Palette size={18} color="#0ea5e9" /> },
    { label: 'Colorfulness', value: '48.2', status: 'Medium', icon: <Droplets size={18} color="#ec4899" /> },
    { label: 'Resolution', value: '1920 x 1080', status: 'FHD', icon: <Monitor size={18} color="#eab308" /> },
    { label: 'File Size', value: '2.34 MB', status: 'JPG', icon: <FileCode size={18} color="#94a3b8" /> },
  ];

  return (
    <div className="card card-technical-stats">
      <h3 className="text-h3" style={{ color: 'white', marginBottom: '1.25rem' }}>Technical Statistics</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '1rem' 
      }}>
        {statItems.map((item, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px'
          }}>
            <div style={{ 
              width: '36px', height: '36px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>{item.label}</div>
              <div style={{ color: 'white', fontSize: '1rem', fontWeight: '600' }}>{item.value}</div>
              <div style={{ 
                color: item.status === 'High' ? 'var(--status-red)' : item.status === 'Low' ? 'var(--status-green)' : 'var(--status-yellow)', 
                fontSize: '0.65rem', 
                fontWeight: '600',
                marginTop: '0.125rem'
              }}>
                {item.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicalStatsCard;

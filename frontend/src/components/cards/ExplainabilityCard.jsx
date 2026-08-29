import React from 'react';
import { Info } from 'lucide-react';

const ExplainabilityCard = ({ imageUrl }) => {
  return (
    <div className="card card-explainability">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <h3 className="text-h3" style={{ color: 'white', margin: 0 }}>Explainability (Grad-CAM)</h3>
        <Info size={14} color="var(--text-muted)" />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem', textAlign: 'center' }}>Original Image</div>
          <div style={{ 
            height: '160px', 
            backgroundColor: '#000', 
            borderRadius: '8px', 
            overflow: 'hidden'
          }}>
            {imageUrl && (
              <img src={imageUrl} alt="Original" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
        </div>
        
        <div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem', textAlign: 'center' }}>Attention Heatmap</div>
          <div style={{ 
            height: '160px', 
            backgroundColor: '#000', 
            borderRadius: '8px', 
            overflow: 'hidden',
            position: 'relative'
          }}>
            {imageUrl && (
              <>
                <img src={imageUrl} alt="Heatmap Base" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {/* CSS gradient overlay to mock a Grad-CAM heatmap */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 50% 50%, rgba(255, 0, 0, 0.7) 0%, rgba(255, 255, 0, 0.5) 30%, rgba(0, 255, 0, 0.3) 60%, rgba(0, 0, 255, 0.2) 100%)',
                  mixBlendMode: 'hard-light',
                  opacity: 0.8
                }} />
              </>
            )}
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <p className="text-small" style={{ margin: 0 }}>
          Heatmap shows regions that influenced the model's quality prediction the most.
        </p>
        <div style={{ width: '32px', height: '18px', backgroundColor: 'var(--primary-accent)', borderRadius: '9px', position: 'relative' }}>
          <div style={{ position: 'absolute', right: '2px', top: '2px', width: '14px', height: '14px', backgroundColor: 'white', borderRadius: '50%' }} />
        </div>
      </div>
    </div>
  );
};

export default ExplainabilityCard;

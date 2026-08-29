import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const QualityGaugeCard = ({ score, status }) => {
  // SVG Gauge calculations
  const radius = 70;
  const strokeWidth = 12;
  const cx = 100;
  const cy = 90;
  
  // Create arc for a semi-circle (180 degrees)
  const arcLength = Math.PI * radius;
  // Calculate stroke-dashoffset based on score (0-100)
  const normalizedScore = Math.max(0, Math.min(100, score || 0));
  const progress = (normalizedScore / 100) * arcLength;
  const offset = arcLength - progress;
  
  // Determine color based on score
  let strokeColor = 'var(--status-green)';
  let statusText = 'ACCEPTABLE';
  if (normalizedScore < 50) {
    strokeColor = 'var(--status-red)';
    statusText = 'DEFECTIVE';
  } else if (normalizedScore < 80) {
    strokeColor = 'var(--status-yellow)';
    statusText = 'DEGRADED';
  }

  // Use override status if provided
  if (status) {
    statusText = status;
    if (status === 'DEFECTIVE') strokeColor = 'var(--status-red)';
    else if (status === 'DEGRADED') strokeColor = 'var(--status-yellow)';
    else strokeColor = 'var(--status-green)';
  }

  return (
    <div className="card card-quality-assessment" style={{ display: 'flex', flexDirection: 'column' }}>
      <h3 className="text-h3" style={{ color: 'white', marginBottom: '1rem', flexShrink: 0 }}>Quality Assessment</h3>
      
      <div style={{ display: 'flex', flexGrow: 1 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '200px', height: '110px' }}>
            <svg width="200" height="110" viewBox="0 0 200 110">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              {/* Background Arc */}
              <path
                d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              {/* Foreground Arc (Colored gradient or solid color) */}
              {score !== null && (
                <path
                  d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={arcLength}
                  strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease' }}
                />
              )}
            </svg>
            <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', lineHeight: '1' }}>
                {score !== null ? score.toFixed(1) : '--'}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>/ 100</div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <div style={{ fontWeight: 'bold', color: strokeColor, letterSpacing: '1px', fontSize: '1.125rem' }}>
              {score !== null ? statusText : 'WAITING'}
            </div>
            <p className="text-small" style={{ marginTop: '0.5rem', maxWidth: '80%' }}>
              The image has {statusText === 'ACCEPTABLE' ? 'no' : 'noticeable'} quality issues that impact overall visual quality.
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: statusText === 'ACCEPTABLE' ? 1 : 0.4 }}>
            <CheckCircle color="var(--status-green)" size={20} />
            <div>
              <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500' }}>Acceptable</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>80 - 100</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: statusText === 'DEGRADED' ? 1 : 0.4 }}>
            <AlertTriangle color="var(--status-yellow)" size={20} />
            <div>
              <div style={{ color: 'var(--status-yellow)', fontSize: '0.875rem', fontWeight: '500' }}>Degraded</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>50 - 79</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: statusText === 'DEFECTIVE' ? 1 : 0.4 }}>
            <XCircle color="var(--status-red)" size={20} />
            <div>
              <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500' }}>Defective</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>0 - 49</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityGaugeCard;

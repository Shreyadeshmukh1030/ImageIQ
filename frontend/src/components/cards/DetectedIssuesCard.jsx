import React from 'react';
import { List } from 'lucide-react';

const DetectedIssuesCard = ({ issues }) => {
  // Map our backend probabilities to a display list
  const formattedIssues = issues && Array.isArray(issues) ? issues
    .map((issueObj) => {
      let severity = 'Low';
      let sevColor = 'var(--status-green)';
      let sevBg = 'var(--status-green-bg)';
      
      const confidence = issueObj.confidence || 0;
      
      if (confidence > 0.7) {
        severity = 'High';
        sevColor = 'var(--status-red)';
        sevBg = 'var(--status-red-bg)';
      } else if (confidence > 0.4) {
        severity = 'Medium';
        sevColor = 'var(--status-yellow)';
        sevBg = 'var(--status-yellow-bg)';
      }
      
      return {
        name: issueObj.type || 'Unknown',
        confidence: Math.round(confidence * 100),
        severity: issueObj.severity ? issueObj.severity.charAt(0).toUpperCase() + issueObj.severity.slice(1) : severity,
        sevColor,
        sevBg
      };
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5) // Show top 5
  : [];

  return (
    <div className="card card-detected-issues" style={{ display: 'flex', flexDirection: 'column' }}>
      <h3 className="text-h3" style={{ color: 'white', marginBottom: '1.5rem', flexShrink: 0 }}>Detected Issues</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        <div>Issue</div>
        <div>Severity</div>
        <div style={{ textAlign: 'right' }}>Confidence</div>
      </div>
      
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
        {formattedIssues.length > 0 ? (
          formattedIssues.map((issue, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', alignItems: 'center', gap: '1rem' }}>
              <div style={{ color: 'white', fontSize: '0.875rem' }}>{issue.name}</div>
              
              <div>
                <span style={{ 
                  backgroundColor: issue.sevBg, 
                  color: issue.sevColor, 
                  fontSize: '0.65rem', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  fontWeight: '600'
                }}>
                  {issue.severity}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'white', fontSize: '0.875rem', width: '30px', textAlign: 'right' }}>{issue.confidence}%</span>
                <div style={{ flexGrow: 1, height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${issue.confidence}%`, height: '100%', backgroundColor: issue.sevColor, borderRadius: '2px' }} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
            No issues detected
          </div>
        )}
      </div>
      
      <button style={{ 
        width: '100%', 
        padding: '0.75rem', 
        marginTop: '1.5rem', 
        background: 'transparent', 
        border: '1px solid rgba(93, 95, 239, 0.3)', 
        color: 'var(--primary-accent)', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        fontWeight: '500'
      }}>
        <List size={16} /> View Issue Details
      </button>
    </div>
  );
};

export default DetectedIssuesCard;

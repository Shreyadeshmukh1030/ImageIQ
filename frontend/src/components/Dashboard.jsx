import React from 'react';
import UploadedImageCard from './cards/UploadedImageCard';
import QualityGaugeCard from './cards/QualityGaugeCard';
import DetectedIssuesCard from './cards/DetectedIssuesCard';
import TechnicalStatsCard from './cards/TechnicalStatsCard';
import ExplainabilityCard from './cards/ExplainabilityCard';
import UploadZoneCard from './cards/UploadZoneCard';
import SampleImagesCard from './cards/SampleImagesCard';

const Dashboard = ({ result, isAnalyzing, onFileSelected, previewUrl, history }) => {
  return (
    <div className="dashboard-container">
      {/* Top Row */}
      <UploadedImageCard imageUrl={previewUrl || result?.image_url} />
      
      <QualityGaugeCard 
        score={result ? result.quality_score : null} 
        status={result?.quality_label} 
      />
      
      <DetectedIssuesCard 
        issues={result?.issues} 
      />

      {/* Middle Row */}
      <TechnicalStatsCard 
        stats={result?.statistics} 
      />

      {/* Bottom Row */}
      <ExplainabilityCard 
        imageUrl={previewUrl || result?.image_url}
      />
      
      <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '3 / 4', gridRow: '3 / 4' }}>
        <UploadZoneCard onFileSelected={onFileSelected} />
      </div>

      {/* Samples Row */}
      <SampleImagesCard onFileSelected={onFileSelected} />
      
      {/* Loading Overlay */}
      {isAnalyzing && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 17, 26, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ 
            width: '48px', height: '48px', 
            border: '4px solid rgba(93, 95, 239, 0.2)',
            borderTopColor: 'var(--primary-accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
          <p style={{ marginTop: '1rem', color: 'white', fontWeight: '500' }}>Analyzing image quality...</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';

function App() {
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [history, setHistory] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const fileInputRef = useRef(null);

  // Fetch history on load
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/history?limit=4');
      if (response.ok) {
        const data = await response.json();
        // Format for the History Card
        const formattedHistory = data.map(item => {
          let status = 'ACCEPTABLE';
          let color = 'var(--status-green)';
          
          if (item.quality_score < 0.5) {
            status = 'DEFECTIVE';
            color = 'var(--status-red)';
          } else if (item.quality_score < 0.8) {
            status = 'DEGRADED';
            color = 'var(--status-yellow)';
          }
          
          return {
            filename: item.filename,
            date: new Date(item.created_at).toLocaleString('en-US', { 
              month: 'short', day: 'numeric', year: 'numeric', 
              hour: '2-digit', minute: '2-digit' 
            }),
            score: item.quality_score,
            status: status,
            color: color
          };
        });
        setHistory(formattedHistory);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleFileSelected = (file) => {
    if (!file) return;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
    
    setShowUploadModal(false);
    uploadAndAnalyze(file);
  };

  const uploadAndAnalyze = async (file) => {
    setIsAnalyzing(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const data = await response.json();
      setResult(data);
      fetchHistory(); // Refresh history
      
    } catch (error) {
      console.error(error);
      alert('Failed to analyze image. Ensure backend is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Layout onUploadClick={() => setShowUploadModal(true)}>
      <Dashboard 
        result={result} 
        isAnalyzing={isAnalyzing} 
        onFileSelected={handleFileSelected}
        previewUrl={previewUrl}
        history={history}
      />
      
      {/* Fallback invisible file input for the TopNav button */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => handleFileSelected(e.target.files[0])} 
        style={{ display: 'none' }} 
        accept="image/*" 
      />
      
      {/* Upload Modal (Triggered by TopNav button) */}
      {showUploadModal && (
        <div className="upload-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={e => e.stopPropagation()}>
            <h2 className="text-h2" style={{ color: 'white', marginBottom: '0.5rem' }}>Upload New Image</h2>
            <p className="text-body" style={{ marginBottom: '1.5rem' }}>Select an image file to analyze.</p>
            
            <div 
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
              onClick={() => {
                setShowUploadModal(false);
                fileInputRef.current.click();
              }}
            >
              <p style={{ color: 'white', fontWeight: '500' }}>Click to browse your files</p>
              <p className="text-small" style={{ marginTop: '0.5rem' }}>JPG, PNG, JPEG (Max 10MB)</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default App;

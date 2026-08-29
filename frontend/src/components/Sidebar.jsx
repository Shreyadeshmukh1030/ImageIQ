import React from 'react';
import { Camera, LayoutDashboard, Image as ImageIcon, History, BarChart2, Settings, Info } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo-container">
        <Camera className="logo-icon" size={32} />
        <div>
          <h2 className="text-h2" style={{ margin: 0, color: 'white' }}>QualiVision <span style={{ color: 'var(--primary-accent)' }}>AI</span></h2>
          <p className="text-small" style={{ margin: 0 }}>Image Quality & Defect Detection</p>
        </div>
      </div>
      
      <div className="nav-links">
        <div className="nav-item active">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>
        <div className="nav-item">
          <ImageIcon size={20} />
          <span>Analyze Image</span>
        </div>
        <div className="nav-item">
          <History size={20} />
          <span>History</span>
        </div>
        <div className="nav-item">
          <BarChart2 size={20} />
          <span>Statistics</span>
        </div>
        <div className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </div>
        <div className="nav-item">
          <Info size={20} />
          <span>About</span>
        </div>
      </div>
      
      <div className="sidebar-footer">
        <h3 className="text-h3" style={{ marginBottom: '0.5rem', color: 'white' }}>About QualiVision AI</h3>
        <p className="text-small" style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
          AI-powered solution to analyze image quality, detect defects and provide actionable insights.
        </p>
        <p className="text-small" style={{ fontSize: '0.65rem' }}>
          © 2026 QualiVision AI<br/>All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;

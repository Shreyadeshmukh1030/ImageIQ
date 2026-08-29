import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const Layout = ({ children, onUploadClick }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopNav onUploadClick={onUploadClick} />
        {children}
      </div>
    </div>
  );
};

export default Layout;

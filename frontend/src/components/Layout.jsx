import React from 'react';
import TopNav from './TopNav';

const Layout = ({ children, onUploadClick }) => {
  return (
    <div className="app-layout no-sidebar">
      <div className="main-content">
        <TopNav onUploadClick={onUploadClick} />
        {children}
      </div>
    </div>
  );
};

export default Layout;

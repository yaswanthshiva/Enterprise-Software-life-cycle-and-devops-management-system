import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export const AppLayout = () => {
  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        <Navbar />
        <main className="page-container animate-fade-in" style={{ flex: 1, padding: '24px 32px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

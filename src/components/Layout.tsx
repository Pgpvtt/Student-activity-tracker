import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AIAssistant from './AIAssistant';
import PWAManager from './PWAManager';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background text-text-main relative">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[200px]">
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
      <AIAssistant />
      <PWAManager />
    </div>
  );
};

export default Layout;

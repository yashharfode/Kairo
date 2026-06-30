import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X, Brain } from 'lucide-react';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Sidebar - Desktop and Mobile sliding drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0 relative z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-heading font-extrabold text-text-primary tracking-tight">KAIRO</span>
          </div>
          
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-text-primary hover:bg-gray-100 transition-colors border border-gray-200"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Dynamic view content */}
        <main className="flex-1 overflow-y-auto min-h-0 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

import React from 'react';
import { LayoutDashboard, Layers, Zap, Menu, Calendar, PlusCircle, Presentation } from 'lucide-react';
import { QuickCaptureModal } from './QuickCaptureModal';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onQuickCapture: (text: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onQuickCapture }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'standup', label: 'Daily Standup', icon: Presentation }, // New Tab
    { id: 'planning', label: 'Planning', icon: Calendar },
    { id: 'buckets', label: 'Buckets & Tasks', icon: Layers },
  ];

  const handleCapture = (text: string) => {
      onQuickCapture(text);
      setIsQuickCaptureOpen(false); 
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">ContextFlow</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button
             onClick={() => setIsQuickCaptureOpen(true)}
             className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md mb-6"
          >
              <PlusCircle className="w-5 h-5 mr-3" />
              Quick Capture
          </button>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t text-xs text-gray-400 text-center">
          v1.1.0 Standup Mode
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b">
           <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-lg font-bold">ContextFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsQuickCaptureOpen(true)}>
                <PlusCircle className="w-6 h-6 text-indigo-600" />
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </header>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
           <div className="md:hidden bg-white border-b p-2">
              {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium ${
                  activeTab === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'
                }`}
              >
                {item.label}
              </button>
            ))}
           </div>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Quick Capture Modal */}
      {isQuickCaptureOpen && (
          <QuickCaptureModal 
            onClose={() => setIsQuickCaptureOpen(false)}
            onCapture={handleCapture}
          />
      )}
    </div>
  );
};

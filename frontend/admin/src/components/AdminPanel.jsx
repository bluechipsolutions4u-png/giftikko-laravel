import React, { useState } from 'react';
import { 
  BarChart3, 
  LayoutGrid, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User, 
  ChevronRight,
  Bell,
  Search,
  ExternalLink,
  Frame
} from 'lucide-react';

import CategoryManager from './CategoryManager';
import FrameManager from './FrameManager';
import ProductManager from './ProductManager';

const AdminPanel = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'products', label: 'Product Gallery', icon: ImageIcon, description: 'Manage your portfolio items' },
    { id: 'categories', label: 'Product Categories', icon: LayoutGrid, description: 'Organize items by type' },
    { id: 'frames', label: 'Frame Studio', icon: Frame, description: 'Configure frame overlays' },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderContent = () => {
    switch (activeTab) {
      case 'products': return <ProductManager />;
      case 'categories': return <CategoryManager />;
      case 'frames': return <FrameManager />;
      default: return <ProductManager />;
    }
  };

  const getPageTitle = () => {
    const active = menuItems.find(item => item.id === activeTab);
    return active ? active.label : 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0 lg:w-[88px]'}
          bg-[#0d3839] transition-all duration-300 ease-in-out flex flex-col
        `}
      >
        {/* Brand/Logo */}
        <div className="h-20 flex items-center px-6 mb-4 shrink-0">
          <div className={`flex items-center gap-3 ${(!isSidebarOpen && 'lg:justify-center lg:w-full')}`}>
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 text-white shrink-0">
               <span className="font-bold text-xl">B</span>
            </div>
            {(isSidebarOpen || window.innerWidth < 1024) && (
              <span className="text-xl font-bold tracking-tight text-white">
                betty<span className="text-teal-400">.</span>
              </span>
            )}
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden ml-auto p-2 text-white/50 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group relative ${
                activeTab === item.id 
                  ? 'bg-white/10 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'text-teal-400' : 'group-hover:text-teal-400'} />
              {(isSidebarOpen || window.innerWidth < 1024) ? (
                <div className="flex flex-col items-start">
                   <span className="text-sm font-semibold">{item.label}</span>
                </div>
              ) : (
                <div className="absolute left-full ml-4 px-3 py-2 bg-[#0d3839] text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 mt-auto space-y-2 shrink-0">
          {isSidebarOpen && (
            <div className="hidden lg:block bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-400/20 flex items-center justify-center text-teal-400 ring-4 ring-teal-400/10">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-widest">Admin</p>
                    <p className="text-[10px] text-slate-400">Betty Studio v1.0</p>
                  </div>
               </div>
            </div>
          )}
          
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all ${
              (!isSidebarOpen && 'lg:justify-center')
            }`}
          >
            <LogOut size={22} />
            {(isSidebarOpen || window.innerWidth < 1024) && <span className="text-sm font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <Menu size={20} />
            </button>
            <div>
               <h2 className="text-[16px] sm:text-[20px] font-bold text-slate-900 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] sm:max-w-none">
                 {getPageTitle()}
               </h2>
            </div>
          </div>

          <div className="flex items-center gap-x-2 sm:gap-x-4">
             <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-200 transition-all">
                <ExternalLink size={14} />
                <span>Visit Store</span>
             </div>
             <div className="hidden sm:block h-8 w-px bg-slate-100 mx-2" />
             <button className="p-2 sm:p-2.5 text-slate-400 hover:text-slate-600 relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
             </button>
             {/* Small mobile avatar */}
             <div className="lg:hidden w-8 h-8 rounded-full bg-teal-400/20 flex items-center justify-center text-teal-400">
                <User size={16} />
             </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {renderContent()}
          </div>
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;

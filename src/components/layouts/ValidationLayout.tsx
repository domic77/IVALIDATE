'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Plus, 
  History, 
  Settings,
  Download,
  Menu,
  X,
  PanelLeft
} from 'lucide-react';

interface ValidationLayoutProps {
  children: React.ReactNode;
}

export function ValidationLayout({ children }: ValidationLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock history data for UI
  const mockHistory = [
    { id: '1', title: 'AI-powered inventory system', date: '2 days ago' },
    { id: '2', title: 'Dog walking marketplace', date: '1 week ago' },
    { id: '3', title: 'Social media scheduler', date: '2 weeks ago' },
    { id: '4', title: 'Meal planning app', date: '3 weeks ago' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'} w-64 bg-white border-r border-gray-200 shadow-lg lg:shadow-none
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-all duration-300 ease-in-out
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {sidebarCollapsed ? (
            <div className="flex items-center justify-center w-full">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-1 rounded-md hover:bg-gray-100"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:flex p-1 rounded-md hover:bg-gray-100"
                >
                  <PanelLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">iV</span>
                </div>
                <span className="font-semibold text-gray-900">iValidate</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-md hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* CREATE Section */}
        <div className="p-4 border-b border-gray-200">
          <Button className={`${sidebarCollapsed ? 'w-8 h-8 p-0 justify-center' : 'w-full justify-start'} bg-blue-600 hover:bg-blue-700 text-white`}>
            <Plus className="w-4 h-4" />
            {!sidebarCollapsed && <span className="ml-2">New Validation</span>}
          </Button>
        </div>

        {/* HISTORY Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {!sidebarCollapsed && (
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Recent Validations
              </h3>
            )}
            <div className="space-y-2">
              {mockHistory.map((item) => (
                <button
                  key={item.id}
                  className={`w-full text-left ${sidebarCollapsed ? 'p-2' : 'p-3'} rounded-lg hover:bg-gray-100 
                           border border-transparent hover:border-gray-200 
                           transition-colors group`}
                  title={sidebarCollapsed ? item.title : ''}
                >
                  <div className={`flex items-start ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                    <MessageSquare className="w-4 h-4 mt-0.5 text-gray-400 group-hover:text-gray-600" />
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.date}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <button className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100`} title={sidebarCollapsed ? 'All History' : ''}>
              <History className="w-4 h-4" />
              {!sidebarCollapsed && <span className="ml-3">All History</span>}
            </button>
            <button className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100`} title={sidebarCollapsed ? 'Settings' : ''}>
              <Settings className="w-4 h-4" />
              {!sidebarCollapsed && <span className="ml-3">Settings</span>}
            </button>
          </div>
          
          {/* User Info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            {sidebarCollapsed ? (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center" title="User - Pro Plan">
                  <span className="text-gray-600 font-medium text-sm">U</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">U</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">User</p>
                  <p className="text-xs text-gray-500">Pro Plan</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Menu Button - PanelLeft Icon */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md hover:bg-gray-100"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
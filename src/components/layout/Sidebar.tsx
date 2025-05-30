import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Home, Clock, Calendar, FileText, Users, Settings } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-900'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`
    }
  >
    <span className="mr-3">{icon}</span>
    {label}
  </NavLink>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isAdmin }) => {
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center">
              <img src="/kamatasi.png" alt="Kammatashir" className="h-8 w-auto" />
              <h2 className="text-xl font-bold text-blue-800 ml-2">Kammatashir</h2>
            </div>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 md:hidden"
              onClick={onClose}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <NavItem to="/dashboard" icon={<Home className="h-5 w-5" />} label="Dashboard" onClick={onClose} />
            <NavItem to="/time-tracking" icon={<Clock className="h-5 w-5" />} label="Time Tracking" onClick={onClose} />
            <NavItem to="/schedule" icon={<Calendar className="h-5 w-5" />} label="My Schedule" onClick={onClose} />
            <NavItem to="/leave-requests" icon={<FileText className="h-5 w-5" />} label="Leave Requests" onClick={onClose} />
            
            {isAdmin && (
              <>
                <div className="mt-6 mb-2 px-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </h3>
                </div>
                
                <NavItem to="/admin" icon={<Settings className="h-5 w-5" />} label="Admin Dashboard" onClick={onClose} />
                <NavItem to="/admin/employees" icon={<Users className="h-5 w-5" />} label="Employees" onClick={onClose} />
                <NavItem to="/admin/schedule" icon={<Calendar className="h-5 w-5" />} label="Schedules" onClick={onClose} />
                <NavItem to="/admin/leave-requests" icon={<FileText className="h-5 w-5" />} label="Leave Approvals" onClick={onClose} />
              </>
            )}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <img src="/kamatasi.png" alt="Kammatashir" className="h-8 w-8" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Kammatashir</p>
                <p className="text-xs font-medium text-gray-500">v1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
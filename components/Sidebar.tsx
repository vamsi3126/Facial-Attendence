import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, LogOut, ShieldCheck, Camera, ScanFace } from 'lucide-react';
import { User, UserRole } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const isAdmin = user.role === UserRole.ADMIN;

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors border-l-4 ${
        isActive 
          ? '!bg-brand-50 !text-brand-700 !border-brand-600' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </NavLink>
  );

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
        <div className="bg-brand-600 p-2 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">FaceAuth</h1>
          <p className="text-xs text-slate-500">Attendance System</p>
        </div>
      </div>

      <div className="p-4 flex flex-col space-y-6 flex-1 overflow-y-auto">
        <div className="flex flex-col space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Menu
          </p>
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          
          {isAdmin ? (
            <>
              <NavItem to="/admin/students" icon={Users} label="Students" />
              <NavItem to="/admin/reports" icon={FileText} label="Attendance Log" />
              <div className="pt-4 pb-2">
                 <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Device</p>
                 <NavItem to="/admin/kiosk" icon={ScanFace} label="Kiosk Mode" />
              </div>
            </>
          ) : (
            <>
              <NavItem to="/student/mark-attendance" icon={Camera} label="Mark Attendance" />
              <NavItem to="/student/history" icon={FileText} label="My History" />
            </>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 mb-4 px-2">
            <img 
                src={user.avatarUrl} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border border-slate-300"
            />
            <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
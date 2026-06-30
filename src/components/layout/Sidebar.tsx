import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Brain, Inbox, Flag, Calendar, CheckSquare, MessageSquare, BookOpen, BarChart3, Settings, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Brain', path: '/brain', icon: Brain },
  { name: 'Smart Inbox', path: '/inbox', icon: Inbox },
  { name: 'Mission Planner', path: '/missions', icon: Flag },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'AI Chat', path: '/chat', icon: MessageSquare },
  { name: 'Knowledge', path: '/knowledge', icon: BookOpen },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { logout, user } = useAuth();

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "w-64 border-r border-gray-200 bg-white h-screen flex flex-col pt-6 pb-4 shrink-0 transition-transform duration-300 z-40 fixed lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-heading font-extrabold text-text-primary tracking-tight">KAIRO</span>
          </div>
          {/* Close button inside mobile menu */}
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 border border-gray-200/50"
          >
            <X className="w-4 h-4 text-text-primary" />
          </button>
        </div>
        
        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose} // Auto-close drawer on link click
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                  isActive 
                    ? "bg-secondary text-primary shadow-sm shadow-primary/5" 
                    : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
                )
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        {/* Footer Area */}
        <div className="px-6 mt-auto">
          {user && (
            <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-gray-50/70 border border-gray-100">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {user.displayName ? user.displayName[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-text-primary truncate">{user.displayName || 'Kairo User'}</p>
                <p className="text-[10px] text-text-secondary truncate">{user.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-colors duration-200 mb-4"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          <div className="bg-secondary/40 rounded-xl p-3 flex flex-col items-start gap-1.5 border border-primary/5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-text-primary">System Online</span>
            </div>
            <p className="text-[9px] text-text-secondary leading-tight">AI Executive OS is ready.</p>
          </div>
        </div>
      </aside>
    </>
  );
};

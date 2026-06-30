
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Brain, Inbox, Flag, Calendar, CheckSquare, MessageSquare, BookOpen, BarChart3, Settings, LogOut } from 'lucide-react';
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

export const Sidebar = () => {
  const { logout, user } = useAuth();

  return (
    <aside className="w-64 border-r border-gray-200 bg-white h-screen flex flex-col pt-6 pb-4">
      <div className="px-6 mb-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-heading font-bold text-text-primary tracking-tight">KAIRO</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                isActive 
                  ? "bg-secondary text-primary" 
                  : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
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
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-colors duration-200 mb-4"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        <div className="bg-secondary/50 rounded-xl p-4 flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success"></div>
            <span className="text-xs font-semibold text-text-primary">System Online</span>
          </div>
          <p className="text-[10px] text-text-secondary leading-tight">AI Executive OS is ready.</p>
        </div>
      </div>
    </aside>
  );
};

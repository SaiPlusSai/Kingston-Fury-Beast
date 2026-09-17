import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const TopHeader = ({ onMenuClick, title }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const notificationsPath = user?.role === 'admin' ? '/admin/notifications' : '/notifications';

  return (
    <header className="h-14 flex-shrink-0 surface-header flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-hover transition-colors"
        >
          <Menu style={{ width: '20px', height: '20px' }} />
        </button>
        {title && (
          <h1 className="text-sm font-semibold text-text-primary font-display hidden sm:block tracking-tight">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link
          to={notificationsPath}
          className="relative p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-hover transition-colors"
        >
          <Bell style={{ width: '18px', height: '18px' }} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 h-4 w-4 bg-danger rounded-full text-[9px] text-white flex items-center justify-center font-bold animate-pulse-subtle">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header >
  );
};

export default TopHeader;

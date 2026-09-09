import React, { useEffect, useState } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { PageLoader } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { notificationsAPI } from '../../services/api';
import { Bell, CheckCheck, Circle } from 'lucide-react';
import clsx from 'clsx';

const typeColors: Record<string, string> = {
  INFO: 'bg-blue-50 text-blue-600',
  SUCCESS: 'bg-emerald-50 text-emerald-600',
  WARNING: 'bg-amber-50 text-amber-600',
  APPLICATION: 'bg-navy-50 text-navy-600',
  MENTORSHIP: 'bg-purple-50 text-purple-600',
  TRAINING: 'bg-teal-50 text-teal-600',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    notificationsAPI.get().then(r => setNotifications(r.data.notifications || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await notificationsAPI.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <><Topbar title="Notifications" /><PageLoader /></>;

  return (
    <div>
      <Topbar title="Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} />
      <div className="p-6 max-w-3xl mx-auto">
        {unreadCount > 0 && (
          <div className="flex justify-end mb-4">
            <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
              <CheckCheck className="w-4 h-4" /> Mark all as read
            </button>
          </div>
        )}

        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up! New notifications will appear here." />
        ) : (
          <div className="space-y-2">
            {notifications.map((n: any) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={clsx('flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer',
                  n.is_read ? 'bg-white border-gray-100' : 'bg-white border-blue-100 shadow-sm'
                )}
              >
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm', typeColors[n.type] || 'bg-gray-100 text-gray-500')}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={clsx('text-sm', n.is_read ? 'text-gray-600' : 'text-gray-900 font-medium')}>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

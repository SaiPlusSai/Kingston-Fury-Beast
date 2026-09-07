import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../services/notificationsApi';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const POLL_INTERVAL = 20000; // 20 seconds

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newArrival, setNewArrival] = useState(null); // latest unseen notification for toast
  const prevCountRef = useRef(0);
  const timerRef = useRef(null);
  const activeRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!user || !localStorage.getItem('accessToken')) return;
    try {
      const items = await listNotifications();
      const list = Array.isArray(items) ? items : items?.items || [];
      const unread = list.filter((n) => !n.isRead).length;

      setNotifications(list);
      setUnreadCount(unread);

      // Detect new arrivals since last poll
      if (prevCountRef.current !== null && unread > prevCountRef.current) {
        const newest = list.find((n) => !n.isRead);
        if (newest) setNewArrival(newest);
      }
      prevCountRef.current = unread;
    } catch {
      // silently fail — don't disrupt the UI
    }
  }, [user]);

  useEffect(() => {
    activeRef.current = true;
    if (!user || !localStorage.getItem('accessToken')) return;

    fetchNotifications();

    const schedule = () => {
      timerRef.current = setTimeout(async () => {
        if (document.visibilityState !== 'hidden') await fetchNotifications();
        if (activeRef.current) schedule();
      }, POLL_INTERVAL);
    };
    schedule();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchNotifications();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      activeRef.current = false;
      clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [user, fetchNotifications]);

  const markRead = useCallback(async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    prevCountRef.current = Math.max(0, prevCountRef.current - 1);
  }, []);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    prevCountRef.current = 0;
  }, []);

  const dismissToast = useCallback(() => setNewArrival(null), []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, newArrival, markRead, markAllRead, dismissToast, refetch: fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  // Return safe defaults when used outside provider (e.g. during hot-reload)
  if (!ctx) return { notifications: [], unreadCount: 0, newArrival: null, markRead: () => {}, markAllRead: () => {}, dismissToast: () => {}, refetch: () => {} };
  return ctx;
};

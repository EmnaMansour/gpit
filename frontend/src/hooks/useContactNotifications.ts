// hooks/useContactNotifications.ts
import { useState, useEffect, useCallback } from 'react';

export interface ContactNotification {
  _id: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  status: 'new' | 'read' | 'pending';
  read: boolean;
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useContactNotifications = (userRole: string, token?: string) => {
  const [notifications, setNotifications] = useState<ContactNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (userRole !== 'Admin') {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/contacts/pending`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        const notificationsList = data.data || [];
        setNotifications(notificationsList);
        setUnreadCount(notificationsList.filter((n: ContactNotification) => !n.read).length);
        setIsConnected(true);
      } else {
        setError('Failed to fetch notifications');
        setIsConnected(false);
      }
    } catch (err: any) {
      console.error('Erreur notifications:', err);
      setError(err.message);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [userRole, token]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch(
          `${API_BASE}/api/contacts/${notificationId}/read`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` })
            }
          }
        );

        if (response.ok) {
          setNotifications(prev =>
            prev.map(notif =>
              notif._id === notificationId
                ? { ...notif, read: true, status: 'read' as const }
                : notif
            )
          );
          setUnreadCount(count => Math.max(0, count - 1));
        }
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    },
    [token]
  );

  // Mark all as read
  const resetNotifications = useCallback(async () => {
    if (userRole !== 'Admin') return;

    try {
      const response = await fetch(
        `${API_BASE}/api/contacts/mark-all-read`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true, status: 'read' as const }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [userRole, token]);

  // Fetch on mount and poll every 30 seconds
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    isConnected,
    refetch: fetchNotifications,
    markAsRead,
    resetNotifications
  };
};

export default useContactNotifications;
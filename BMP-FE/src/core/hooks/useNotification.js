import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import ApiService from "../services/api.service";
import { getSocket } from "../services/websocket.service";

export const useNotifications = (role) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const user = useSelector((state) => state.auth.user);

  const notificationsRef = useRef([]);
  notificationsRef.current = notifications;

  // ✅ FETCH NOTIFICATIONS (FIXED)
  const fetchNotifications = useCallback(async (pageNum = 1) => {
    if (!role || !user?.id) return;
    try {
      setLoading(true);
      setError(null);

      const res = await ApiService.getNotifications(role, pageNum, 20);

      console.log("API RESPONSE:", res.data);

      // 🔥 FIXED PARSING
      const apiData = res?.data?.data || {};

      const data = Array.isArray(apiData.data)
        ? apiData.data
        : [];

      const totalPages = apiData.totalPages || 1;

      setNotifications((prev) =>
        pageNum === 1 ? data : [...(prev || []), ...data]
      );

      setPage(pageNum);
      setHasMore(pageNum < totalPages);

    } catch (err) {
      console.error("[useNotifications] fetch error:", err);
      setNotifications([]);
      setError(err?.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [role, user?.id]);

  // ✅ INITIAL LOAD
  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  // ✅ SOCKET (REAL-TIME)
  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();
    if (!socket) return;

    socket.connect();
    socket.emit("join_user", user.id);

    const handleNew = (notification) => {
      if (notification.role !== role) return;

      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === notification.id);
        if (exists) return prev;
        return [notification, ...prev];
      });
    };

    socket.on("new_notification", handleNew);

    return () => {
      socket.off("new_notification", handleNew);
    };
  }, [user?.id, role]);

  // ✅ MARK ONE
  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) =>
      (prev || []).map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      )
    );

    try {
      await ApiService.markNotificationRead(id);
    } catch (err) {
      console.error(err);
      fetchNotifications(1);
    }
  }, [fetchNotifications]);

  // ✅ MARK ALL
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) =>
      (prev || []).map((n) => ({ ...n, is_read: true }))
    );

    try {
      await ApiService.markAllNotificationsRead(role);
    } catch (err) {
      console.error(err);
      fetchNotifications(1);
    }
  }, [role, fetchNotifications]);

  // ✅ DELETE
  const deleteNotification = useCallback(async (id) => {
    const removed = notificationsRef.current.find((n) => n.id === id);

    setNotifications((prev) =>
      (prev || []).filter((n) => n.id !== id)
    );

    try {
      await ApiService.deleteNotification(id);
    } catch (err) {
      console.error(err);
      if (removed) {
        setNotifications((prev) => [removed, ...(prev || [])]);
      }
    }
  }, []);

  // ✅ LOAD MORE
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1);
    }
  }, [loading, hasMore, page, fetchNotifications]);

  // ✅ UNREAD COUNT SAFE
  const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

  return {
    notifications: notifications || [],
    loading,
    error,
    unreadCount,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refresh: () => fetchNotifications(1),
  };
};
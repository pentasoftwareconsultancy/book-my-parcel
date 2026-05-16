/**
 * useUnreadCount — fetches the accurate unread notification count from the
 * backend Redis cache. Much lighter than loading all notifications.
 *
 * - Fetches on mount
 * - Increments in real-time when a new_notification socket event arrives
 * - Resets to 0 when mark-all-read is triggered
 */
import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import ApiService from "../services/api.service";
import ServerUrl from "../constants/serverUrl.constant";
import { getSocket } from "../services/websocket.service";

export function useUnreadCount() {
  const [count, setCount] = useState(0);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated) { setCount(0); return; }
    try {
      const res = await ApiService.apiget(ServerUrl.API_NOTIFICATIONS_COUNT);
      const val = res?.data?.data?.unread_count ?? 0;
      setCount(Number(val));
    } catch {
      // silent — don't break the header
    }
  }, [isAuthenticated]);

  // Fetch on mount and when auth changes
  useEffect(() => { fetchCount(); }, [fetchCount]);

  // Real-time: increment on new notification, reset on mark-all-read
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const socket = getSocket();
    if (!socket) return;

    const onNew     = () => setCount((c) => c + 1);
    const onReadAll = () => fetchCount(); // re-fetch from backend to get accurate count
    const onReadOne = () => setCount((c) => Math.max(0, c - 1));

    socket.on("new_notification",       onNew);
    socket.on("notifications_read_all", onReadAll);
    socket.on("notification_read",      onReadOne);

    return () => {
      socket.off("new_notification",       onNew);
      socket.off("notifications_read_all", onReadAll);
      socket.off("notification_read",      onReadOne);
    };
  }, [isAuthenticated, user?.id]);

  return { count, refresh: fetchCount };
}

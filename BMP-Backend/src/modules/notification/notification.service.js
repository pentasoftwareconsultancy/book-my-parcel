import Notification from "./notification.model.js";
import sequelize from "../../config/database.config.js";
import { getPagination, getPagingData } from "../../utils/pagination.js";
import { publishRealtimeEvent } from "../../redis/services/redisRealtime.service.js";
import { incrementNotificationCount, decrementNotificationCount, invalidateNotificationCount } from "../../redis/cache/notificationCountCache.service.js";
import { sendMsg91SMS } from "./msg91.sms.js";

// ─── Create & emit ────────────────────────────────────────────────────────────
export async function createNotification(io, { user_id, role, type_code, title, message, meta = null }) {
  const notification = await Notification.create({
    user_id, role, type_code, title, message, meta,
  });

  await incrementNotificationCount(user_id);

  const published = await publishRealtimeEvent("notification:new", { user_id, notification });
  if (!published && io) {
    io.to(`user_${user_id}`).emit("new_notification", notification);
  }

  // ── SMS via MSG91 (best-effort, non-fatal) ──────────────
  try {
    const [row] = await sequelize.query(
      `SELECT phone_number FROM users WHERE id = :user_id LIMIT 1`,
      { replacements: { user_id }, type: sequelize.QueryTypes.SELECT }
    );

    // type_code: caller passes the full data object as meta; the MSG91 key
    // lives at meta.type_code (not the top-level type_code which is "general"/role).
    const smsTypeCode = meta?.type_code || type_code;

    // var1/var2/var3 may be nested under meta.meta (when sendToTraveller/sendToUser
    // wraps the caller's data object as the `meta` field) or at the top level.
    // Unwrap one level so sendMsg91SMS always sees { var1, var2, var3 } directly.
    const smsVars = meta?.meta || meta;

    if (row?.phone_number && smsVars && smsTypeCode) {
      await sendMsg91SMS({
        phone: row.phone_number,
        type_code: smsTypeCode,
        meta: smsVars,
      });
    }
  } catch (smsErr) {
    console.error(`❌ [MSG91] SMS failed for ${user_id}:`, smsErr.message);
  }

  return notification;
}

// ─── Get paginated notifications ──────────────────────────────────────────────
export async function getNotificationsService({ user_id, role, page = 1, limit = 20 }) {
  const { limit: parsedLimit, offset, page: parsedPage } = getPagination(page, limit);

  const result = await Notification.findAndCountAll({
    where: { user_id, role },
    order: [["created_at", "DESC"]],
    limit: parsedLimit,
    offset,
  });

  return getPagingData(result, parsedPage, parsedLimit);
}

// ─── Mark one as read ─────────────────────────────────────────────────────────
export async function markOneReadService(id, user_id) {
  const notification = await Notification.findOne({ where: { id, user_id } });
  if (!notification) throw new Error("Notification not found");

  const wasUnread = !notification.is_read;
  await notification.update({ is_read: true });

  if (wasUnread) {
    await decrementNotificationCount(user_id);
  }

  return notification;
}

// ─── Mark all as read ─────────────────────────────────────────────────────────
export async function markAllReadService(user_id, role) {
  await Notification.update(
    { is_read: true },
    { where: { user_id, role, is_read: false } }
  );

  await invalidateNotificationCount(user_id);
}

// ─── Delete one ───────────────────────────────────────────────────────────────
export async function deleteNotificationService(id, user_id) {
  const notification = await Notification.findOne({ where: { id, user_id } });
  if (!notification) throw new Error("Notification not found");

  const wasUnread = !notification.is_read;
  await notification.destroy();

  if (wasUnread) {
    await decrementNotificationCount(user_id);
  }
}
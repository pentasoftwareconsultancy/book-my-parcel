import { Worker } from "bullmq";
import redis from "../redis/redis.config.js";
import Notification from "../modules/notification/notification.model.js";
import { sendMsg91SMS } from "../modules/notification/msg91.sms.js";  // ← add this

// user/traveller model to fetch phone number — adjust path if different
import User from "../modules/user/user.model.js";
import Traveller from "../modules/traveller/traveller.model.js";

if (!redis) {
  console.warn("⚠️  [NotificationJob] Redis not available — notification queue worker disabled");
}

const notificationWorker = redis
  ? new Worker(
      "notification-queue",
      async (job) => {
        const { user_id, role, type_code, title, message, meta } = job.data;

        // 1. Save to DB
        const notification = await Notification.create({
          user_id, role, type_code, title, message, meta,
        });

        // 2. Emit via socket
        const io = global.io;
        if (io) {
          io.to(`user_${user_id}`).emit("new_notification", {
            id:      notification.id,
            title:   notification.title,
            message: notification.message,
            is_read: false,
          });
        }

        // 3. Send SMS via MSG91
        try {
          let phone = null;

          console.log(`[NotificationJob] Attempting SMS for role=${role}, user_id=${user_id}, type_code=${type_code}`);

          if (role === "user") {
            const user = await User.findByPk(user_id, { attributes: ["phone_number"] });
            console.log(`[NotificationJob] User lookup: ${user_id} → phone_number=${user?.phone_number}`);
            phone = user?.phone_number;
          } else if (role === "traveller") {
            const traveller = await Traveller.findByPk(user_id, { attributes: ["phone_number"] });
            console.log(`[NotificationJob] Traveller lookup: ${user_id} → phone_number=${traveller?.phone_number}`);
            phone = traveller?.phone_number;
          }

          console.log(`[NotificationJob] Final phone value: ${phone}`);

          if (phone) {
            console.log(`[NotificationJob] Sending SMS with phone=${phone}, type_code=${type_code}, meta=${JSON.stringify(meta)}`);
            const smsResult = await sendMsg91SMS({
              phone,
              type_code,
              meta,
              // channel: "both"  ← uncomment when WhatsApp is ready
            });
            console.log(`[NotificationJob] SMS result:`, smsResult);
          } else {
            console.warn(`[NotificationJob] ⚠️ No phone found for ${role} ${user_id}`);
          }
        } catch (err) {
          // SMS failure must never fail the job
          console.error(`❌ [MSG91] Failed for user ${user_id}:`, err.message);
          console.error(`❌ [MSG91] Stack:`, err.stack);
        }

        return notification;
      },
      { connection: redis, concurrency: 5 }
    )
  : null;

if (notificationWorker) {
  notificationWorker.on("completed", (job) => {
    console.log(`✅ Notification Job Done: ${job.id}`);
  });
  notificationWorker.on("failed", (job, err) => {
    console.error(`❌ Notification Job Failed: ${job?.id}`, err);
  });
}

export default notificationWorker;
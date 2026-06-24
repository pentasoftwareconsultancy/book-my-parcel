/**
 * PM2 Ecosystem Configuration
 * Hostinger VPS KVM 4 — 4 CPU cores, 16 GB RAM
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 reload ecosystem.config.cjs --env production   (zero-downtime reload)
 *   pm2 save                                            (persist across reboots)
 */

module.exports = {
  apps: [
    {
      name: "bmp-backend",
      script: "server.js",

      // ── Cluster mode: 3 workers (not 4) ───────────────────────────────────
      // KVM 4 has 4 cores. Using 3 workers leaves 1 core free for PostgreSQL,
      // Redis, and OS scheduling — prevents CPU contention under load.
      // Socket.IO uses the Redis adapter so all workers share pub/sub channels.
      instances: 3,
      exec_mode: "cluster",

      // ── Node.js flags ──────────────────────────────────────────────────────
      // 2 GB heap per worker: 3 × 2 GB = 6 GB for Node.js.
      // Remaining ~10 GB covers PostgreSQL (~2 GB), Redis (~512 MB), OS (~1 GB),
      // and leaves ~6 GB headroom — prevents OOM kills under traffic spikes.
      node_args: "--max-old-space-size=2048",

      // ── Environment ────────────────────────────────────────────────────────
      // CASHFREE_ENV is set explicitly here so PM2 cluster workers always have
      // the correct value — dotenv alone is not reliable in cluster mode because
      // workers may initialise the Cashfree singleton before dotenv runs.
      env: {
        NODE_ENV: "development",
        PORT: 3000,
        CASHFREE_ENV: "PRODUCTION",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        CASHFREE_ENV: "PRODUCTION",
      },

      // ── Logging ────────────────────────────────────────────────────────────
      out_file:        "./logs/pm2-out.log",
      error_file:      "./logs/pm2-error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      log_type: "json",

      // ── Auto-restart policy ────────────────────────────────────────────────
      watch: false,                  // never watch in production
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",             // must stay up 10s to count as a successful start
      restart_delay: 4000,           // wait 4s between restarts

      // ── Memory guard ──────────────────────────────────────────────────────
      max_memory_restart: "2G",      // restart worker if it exceeds 2 GB

      // ── Graceful shutdown ─────────────────────────────────────────────────
      kill_timeout: 10000,           // give 10s for in-flight requests to finish
      listen_timeout: 8000,          // wait 8s for the app to start listening
      shutdown_with_message: true,

      // ── Source maps ───────────────────────────────────────────────────────
      source_map_support: false,
    },
  ],
};

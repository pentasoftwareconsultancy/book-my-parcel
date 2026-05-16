/**
 * StorageService — single source of truth for client-side persistence.
 *
 * Token storage strategy:
 *   - "rememberMe" login  → localStorage   (persists across browser sessions)
 *   - normal login        → sessionStorage  (cleared when tab/browser closes)
 *
 * All reads check sessionStorage first, then localStorage, so the interceptor,
 * WebSocket service, and Redux slice all get the correct token regardless of
 * which storage the login flow used.
 */

const TOKEN_KEY_STORAGE_TYPE = "__bmp_token_storage__"; // tracks which storage holds the token

class StorageService {
  // ── Write ────────────────────────────────────────────────────────────────

  /**
   * Persist a value.
   * @param {string} key
   * @param {*} data
   * @param {{ session?: boolean }} options
   *   session: true  → sessionStorage (default for token when rememberMe=false)
   *   session: false → localStorage   (default for everything else)
   */
  static setData(key, data, { session = false } = {}) {
    const serialized = typeof data === "string" ? data : JSON.stringify(data);
    const storage = session ? sessionStorage : localStorage;
    storage.setItem(key, serialized);

    // Track which storage holds the token so we can clean up correctly on logout
    if (key === "token") {
      localStorage.setItem(TOKEN_KEY_STORAGE_TYPE, session ? "session" : "local");
    }
  }

  /**
   * Read a value — checks sessionStorage first, then localStorage.
   * This ensures the token is found regardless of which storage login used.
   */
  static getData(key) {
    const raw =
      sessionStorage.getItem(key) ??
      localStorage.getItem(key);

    if (raw && raw !== "undefined" && raw !== "null") {
      try {
        return JSON.parse(raw);
      } catch {
        return raw; // plain string (e.g. raw JWT)
      }
    }
    return null;
  }

  /**
   * Remove a value from both storages to avoid stale data.
   */
  static removeData(key) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
    if (key === "token") {
      localStorage.removeItem(TOKEN_KEY_STORAGE_TYPE);
    }
  }

  /**
   * Clear all app data from both storages.
   */
  static clearAll() {
    localStorage.clear();
    sessionStorage.clear();
  }
}

export default StorageService;

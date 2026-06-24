import { Cashfree, CFEnvironment } from "cashfree-pg";

let cashfree = null;
let cashfreeInitEnv = null; // track which env the singleton was built with

export function getCashfree() {
  const currentEnv = process.env.CASHFREE_ENV;

  // Rebuild the singleton if it hasn't been created yet, OR if the env
  // has changed since it was last created (e.g. hot-reload, test teardown).
  if (!cashfree || cashfreeInitEnv !== currentEnv) {
    const env =
      currentEnv === "PRODUCTION"
        ? CFEnvironment.PRODUCTION   // 2 → https://api.cashfree.com/pg
        : CFEnvironment.SANDBOX;     // 1 → https://sandbox.cashfree.com/pg

    cashfree = new Cashfree(
      env,
      process.env.CASHFREE_APP_ID,
      process.env.CASHFREE_SECRET_KEY
    );

    cashfreeInitEnv = currentEnv;

    const url = env === CFEnvironment.PRODUCTION
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";

    console.log(`[Cashfree] Initialized in ${currentEnv || "SANDBOX"} mode → ${url}`);
  }

  return cashfree;
}

// Exposed for tests — resets the singleton so getCashfree() re-initializes
export function resetCashfreeClient() {
  cashfree = null;
  cashfreeInitEnv = null;
}
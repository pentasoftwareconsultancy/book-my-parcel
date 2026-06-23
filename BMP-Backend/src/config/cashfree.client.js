import { Cashfree, CFEnvironment } from "cashfree-pg";

let cashfree = null;

export function getCashfree() {
  if (!cashfree) {
    const env =
      process.env.CASHFREE_ENV === "PRODUCTION"
        ? CFEnvironment.PRODUCTION   // 2 → https://api.cashfree.com/pg
        : CFEnvironment.SANDBOX;     // 1 → https://sandbox.cashfree.com/pg

    cashfree = new Cashfree(
      env,
      process.env.CASHFREE_APP_ID,
      process.env.CASHFREE_SECRET_KEY
    );

    const url = env === CFEnvironment.PRODUCTION
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";

    console.log(`[Cashfree] Initialized in ${process.env.CASHFREE_ENV || "SANDBOX"} mode → ${url}`);
  }

  return cashfree;
}

// Exposed for tests — resets the singleton so getCashfree() re-initializes
export function resetCashfreeClient() {
  cashfree = null;
}
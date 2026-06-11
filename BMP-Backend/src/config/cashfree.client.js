import { Cashfree } from "cashfree-pg";

let cashfree = null;

export function getCashfree() {
  if (!cashfree) {
    cashfree = new Cashfree(
      Cashfree.SANDBOX, // or Cashfree.PRODUCTION
      process.env.CASHFREE_APP_ID,
      process.env.CASHFREE_SECRET_KEY
    );
  }
  return cashfree;
}
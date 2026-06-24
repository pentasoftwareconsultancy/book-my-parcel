/**
 * Socket.IO singleton.
 *
 * Stores the io instance once after server startup so that services
 * can import getIO() without creating a circular dependency on app.js.
 *
 * Usage:
 *   // server.js — after creating the io instance:
 *   import { setIO } from "./src/socket.js";
 *   setIO(io);
 *
 *   // anywhere else:
 *   import { getIO } from "../socket.js";
 *   const io = getIO();
 */

let _io = null;

export function setIO(io) {
  _io = io;
}

/** Returns the io instance, or null before server startup completes. */
export function getIO() {
  return _io;
}

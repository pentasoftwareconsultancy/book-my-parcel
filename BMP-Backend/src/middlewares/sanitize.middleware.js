/**
 * Input sanitization middleware.
 * Strips null bytes, trims string values, and removes HTML/script tags from
 * string fields to prevent stored XSS.
 * Runs after body-parser, before routes.
 *
 * Strategy:
 *  - Plain-text fields (names, addresses, etc.): strip ALL HTML tags
 *  - Uses a simple regex tag stripper — no extra dependency needed for plain-text fields
 */

function stripHtml(str) {
  // Remove all HTML/script tags — safe for plain-text fields
  return str.replace(/<[^>]*>/g, "");
}

function sanitizeValue(value) {
  if (typeof value === "string") {
    // Remove null bytes, strip HTML tags, then trim
    return stripHtml(value.replace(/\0/g, "")).trim();
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === "object") {
    return sanitizeObject(value);
  }
  return value;
}

function sanitizeObject(obj) {
  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = sanitizeValue(obj[key]);
  }
  return result;
}

export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
}

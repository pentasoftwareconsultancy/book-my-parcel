import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { fileTypeFromBuffer } from "file-type";

const MAX_IMAGE_SIZE_BYTES = 6 * 1024 * 1024;

function safeImageFilename(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  return `${Date.now()}-${randomUUID()}${ext}`;
}

// Explicit MIME type allowlist validated from magic bytes (not client header)
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

/**
 * Magic-bytes file filter — ignores the client-supplied Content-Type header.
 * Reads actual bytes from the buffer to determine the real MIME type.
 * Falls back to the client header only when file-type can't detect (e.g. HEIC).
 */
const fileFilter = async (req, file, cb) => {
  try {
    // Collect the full buffer via stream so we can inspect bytes
    const chunks = [];
    file.stream.on("data", (chunk) => chunks.push(chunk));
    file.stream.on("end", async () => {
      const buffer = Buffer.concat(chunks);
      // Attach buffer so storage can write it without re-reading
      file._buffer = buffer;

      const detected = await fileTypeFromBuffer(buffer);
      const mime = detected?.mime || file.mimetype;

      if (ALLOWED_MIME_TYPES.has(mime)) {
        cb(null, true);
      } else {
        cb(new Error(`File type not allowed: ${mime}. Only JPEG, PNG, WebP, or HEIC images are accepted.`), false);
      }
    });
    file.stream.on("error", (err) => cb(err, false));
  } catch (err) {
    cb(err, false);
  }
};

// ── Storage: write buffer to disk after magic-bytes validation ───────────────
function makeBufferStorage(uploadDir) {
  return {
    _handleFile(req, file, cb) {
      const destDir = path.join(uploadDir);
      fs.mkdirSync(destDir, { recursive: true });
      const filename = safeImageFilename(file);
      const dest = path.join(destDir, filename);

      const finish = (buffer) => {
        fs.writeFile(dest, buffer, (err) => {
          if (err) return cb(err);
          cb(null, { destination: destDir, filename, path: dest, size: buffer.length });
        });
      };

      if (file._buffer) {
        finish(file._buffer);
      } else {
        const chunks = [];
        file.stream.on("data", (c) => chunks.push(c));
        file.stream.on("end", () => finish(Buffer.concat(chunks)));
        file.stream.on("error", cb);
      }
    },
    _removeFile(req, file, cb) {
      fs.unlink(file.path, cb);
    },
  };
}

export const upload = multer({
  storage: makeBufferStorage(path.join("uploads", "parcels")),
  fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 10 },
});

export const uploadProfile = multer({
  storage: makeBufferStorage(path.join("uploads", "profiles")),
  fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 1 },
});

// KYC document uploads — stored in uploads/kyc/
export const uploadKyc = multer({
  storage: makeBufferStorage(path.join("uploads", "kyc")),
  fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 5 },
});

// Helper to return array of uploaded file paths
export async function uploadFiles(files) {
  if (!files || files.length === 0) return [];
  return files.map((file) => `/uploads/parcels/${file.filename}`);
}



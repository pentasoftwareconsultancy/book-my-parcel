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

// Allowed MIME types (real validation after reading file)
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

// ✅ SAFE fileFilter (NO STREAM USAGE HERE)
const fileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

// ─── Custom Buffer Storage ────────────────────────────────────────────────
function makeBufferStorage(uploadDir) {
  return {
    _handleFile(req, file, cb) {
      const chunks = [];

      file.stream.on("data", (chunk) => chunks.push(chunk));

      file.stream.on("end", async () => {
        try {
          const buffer = Buffer.concat(chunks);

          // 🔥 Magic-byte validation (REAL security check)
          const detected = await fileTypeFromBuffer(buffer);
          const mime = detected?.mime || file.mimetype;

          if (!ALLOWED_MIME_TYPES.has(mime)) {
            return cb(
              new Error(`Invalid file type: ${mime}`)
            );
          }

          const destDir = path.join(uploadDir);
          fs.mkdirSync(destDir, { recursive: true });

          const filename = safeImageFilename(file);
          const dest = path.join(destDir, filename);

          fs.writeFile(dest, buffer, (err) => {
            if (err) return cb(err);

            cb(null, {
              destination: destDir,
              filename,
              path: dest,
              size: buffer.length,
            });
          });

        } catch (err) {
          cb(err);
        }
      });

      file.stream.on("error", cb);
    },

    _removeFile(req, file, cb) {
      fs.unlink(file.path, cb);
    },
  };
}

// ─── Upload Instances ─────────────────────────────────────────────────────
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

export const uploadKyc = multer({
  storage: makeBufferStorage(path.join("uploads", "kyc")),
  fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 5 },
});

// ─── Helper ───────────────────────────────────────────────────────────────
export async function uploadFiles(files) {
  if (!files || files.length === 0) return [];
  return files.map((file) => `/uploads/parcels/${file.filename}`);
}
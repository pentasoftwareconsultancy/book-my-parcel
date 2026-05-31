import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

const MAX_IMAGE_SIZE_BYTES = 6 * 1024 * 1024;

function safeImageFilename(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  return `${Date.now()}-${randomUUID()}${ext}`;
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join("uploads", "parcels");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, safeImageFilename(file));
  },
});

// Configure multer storage for profile photos
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join("uploads", "profiles");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, safeImageFilename(file));
  },
});

// Explicit MIME type allowlist — rejects SVG (XSS risk) and other non-photo types
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

// Accept only safe image formats
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WebP, or HEIC images are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 10 },
});

export const uploadProfile = multer({
  storage: profileStorage,
  fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 1 },
});

// KYC document uploads — stored in uploads/kyc/
const kycStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join("uploads", "kyc");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, safeImageFilename(file));
  },
});

export const uploadKyc = multer({
  storage: kycStorage,
  fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 5 },
});

// Helper to return array of uploaded file paths
export async function uploadFiles(files) {
  if (!files || files.length === 0) return [];
  return files.map((file) => `/uploads/parcels/${file.filename}`);
}



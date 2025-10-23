import multer from 'multer';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// File validation
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'image/svg+xml'
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate secure filename: timestamp + random + original extension
    const ext = path.extname(file.originalname);
    const randomId = randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const filename = `${timestamp}-${randomId}${ext}`;
    cb(null, filename);
  }
});

// File filter for security
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`));
  }
  cb(null, true);
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Only single file upload
  }
});

/**
 * Convert uploaded file path to public URL
 */
export function getPublicUrl(filename: string): string {
  return `/uploads/${filename}`;
}

/**
 * Delete uploaded file
 */
export function deleteUploadedFile(filename: string): void {
  try {
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Failed to delete file:', error);
  }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return path.extname(filename);
}

/**
 * Validate file size before upload
 */
export function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

/**
 * Get file info for validation
 */
export interface FileInfo {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
}

export function getFileInfo(file: Express.Multer.File): FileInfo {
  return {
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    url: getPublicUrl(file.filename)
  };
}
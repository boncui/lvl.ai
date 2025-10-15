import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { env } from '@/config/env';
import { CustomError } from '@/middleware/errorHandler';

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.UPLOAD_PATH);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  const allowedTypes = /\.(jpeg|jpg|png|gif|pdf|doc|docx)$/i;
  const extname = allowedTypes.test(file.originalname);
  const mimetype = file.mimetype.match(/^(image|application)\/(jpeg|jpg|png|gif|pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/i);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    const error = new CustomError(`Invalid file type: ${file.mimetype}. Only images (jpeg, jpg, png, gif) and documents (pdf, doc, docx) are allowed.`, 400);
    cb(error);
  }
};

// Configure multer
const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE // 5MB default
  },
  fileFilter
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new CustomError('File too large. Maximum size allowed is 5MB.', 400));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new CustomError('Too many files uploaded.', 400));
          }
        }
        return next(err);
      }
      next();
    });
  };
};

// Middleware for multiple file upload
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new CustomError('File too large. Maximum size allowed is 5MB.', 400));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new CustomError(`Too many files uploaded. Maximum ${maxCount} files allowed.`, 400));
          }
        }
        return next(err);
      }
      next();
    });
  };
};

// Middleware for specific fields upload
export const uploadFields = (fields: multer.Field[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.fields(fields)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new CustomError('File too large. Maximum size allowed is 5MB.', 400));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new CustomError('Too many files uploaded.', 400));
          }
        }
        return next(err);
      }
      next();
    });
  };
};

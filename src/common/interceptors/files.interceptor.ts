import 'multer';
import { BadRequestException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { diskStorage, memoryStorage } from 'multer';
import path, { extname } from 'path';
import * as fs from 'fs';

const normalizeFilename = (str: string): string => {
  const originalName = str.replace(/\s/g, '_');
  const extension = originalName.split('.').pop();
  const timestamp = Date.now();

  if (!extension) {
    throw new Error('Failed to determine file extension');
  }

  return `${timestamp}_${originalName}`;
};

const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'text/plain',
  'video/mp4',
  'video/mpeg',
];
const allowedExtensions = [
  '.jpeg',
  '.jpg',
  '.png',
  '.gif',
  '.pdf',
  '.csv',
  '.xls',
  '.xlsx',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.txt',
  '.mp4',
];

export const SingleFileInterceptor = (directory: string, fieldName: string) =>
  FilesInterceptor(fieldName, 25, {
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    storage: diskStorage({
      destination(_req: Request, _file: any, callback) {
        if (!existsSync('./public')) mkdirSync('./public');
        if (!existsSync('./public/uploads')) mkdirSync('./public/uploads');
        if (!existsSync(`./public/uploads/${directory}`))
          mkdirSync(`./public/uploads/${directory}`);

        callback(null, `./public/uploads/${directory}`);
      },
      // filename(_req, file, callback) {
      //   callback(null, normalizeFilename(file.originalname));
      // },
      filename(req: Request, file, callback) {
        const filename = normalizeFilename(file.originalname);
        const relativePath = `uploads/${directory}/${filename}`;
        file.key = relativePath;

        req.body[fieldName] = relativePath;

        callback(null, normalizeFilename(file.originalname));
      },
    }),
    fileFilter(_req, file, callback) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(
          new BadRequestException(`Unsupported file type: ${file.mimetype}.`),
          false,
        );
      }

      const ext = extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        return callback(new Error('Invalid file extension!'), false);
      }

      callback(null, true);
    },
  });

export const deleteFileFromServer = async (imageKey: string) => {
  try {
    if (existsSync(`./public/${imageKey}`)) {
      unlinkSync(`./public/${imageKey}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

/**
 * Uploads a buffer to local disk storage.
 * @param fileName
 * @param fileBuffer
 * @param fileRemotePath
 * @returns relative file path
 */
export const uploadFileToLocalBuffer = async (
  fileName: string,
  fileBuffer: Buffer,
  fileRemotePath: string,
): Promise<string> => {
  try {
    const dirPath = path.join('./public', fileRemotePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, fileName);
    fs.writeFileSync(filePath, fileBuffer);

    return path.join(fileRemotePath, fileName);
  } catch (error) {
    console.error('Error uploading buffer to local storage:', error);
    throw new Error('Failed to upload buffer to local storage');
  }
};

export const memoryFileInterceptor = (fieldName: string) =>
  FileInterceptor(fieldName, {
    storage: memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
  });

export const memoryFilesInterceptor = (
  fieldName: string,
  maxCount: number = 25,
) =>
  FilesInterceptor(fieldName, maxCount, {
    storage: memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
  });

import type { ActionFunctionArgs } from '@remix-run/node';
import { json, unstable_parseMultipartFormData, unstable_createFileUploadHandler } from '@remix-run/node';
import { flexibleAuth, logRequest } from '../lib/middleware.server';
import { rateLimitMiddleware } from '../lib/rate-limit.server';
import { prisma } from '../lib/prisma.server';
import { 
  UploadRequestSchema, 
  UploadResponseSchema,
  createErrorResponse 
} from '../lib/validation.server';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

// File validation constants
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'image/svg+xml'
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json(createErrorResponse('Method not allowed', 'METHOD_NOT_ALLOWED'), { status: 405 });
  }

  try {
    // Use hardened middleware for authentication
    const context = await flexibleAuth(request);
    logRequest(request, context);

    // Apply strict rate limiting for uploads
    const rateLimitResponse = await rateLimitMiddleware(request, 'uploads', context);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Setup file upload handler
    const uploadHandler = unstable_createFileUploadHandler({
      directory: path.join(process.cwd(), 'public', 'uploads'),
      file: ({ filename, contentType }) => {
        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(contentType)) {
          throw new Error(`Invalid file type: ${contentType}`);
        }
        
        // Generate secure filename
        const ext = path.extname(filename || '');
        const randomId = randomBytes(8).toString('hex');
        const timestamp = Date.now();
        return `${timestamp}-${randomId}${ext}`;
      },
      maxPartSize: MAX_FILE_SIZE
    });

    // Parse multipart form data
    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    
    const file = formData.get('file') as File;
    const kindParam = (formData.get('kind') as string) || 'logo';

    if (!file) {
      return json(createErrorResponse('No file provided', 'FILE_REQUIRED'), { status: 400 });
    }

    // Validate kind with Zod schema
    const validationResult = UploadRequestSchema.safeParse({ kind: kindParam });
    if (!validationResult.success) {
      return json(createErrorResponse(
        validationResult.error.errors[0].message,
        'VALIDATION_ERROR'
      ), { status: 400 });
    }

    const { kind } = validationResult.data;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return json(createErrorResponse(
        `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        'FILE_TOO_LARGE'
      ), { status: 400 });
    }

    // Get file URL (file.name contains the generated filename)
    const fileUrl = `/uploads/${file.name}`;

    // Delete existing asset of same kind
    const existingAsset = await prisma.asset.findFirst({
      where: {
        shopId: context.shopRecord.id,
        kind: kind
      }
    });

    if (existingAsset) {
      await prisma.asset.delete({
        where: { id: existingAsset.id }
      });
    }

    // Save new asset to database
    const asset = await prisma.asset.create({
      data: {
        shopId: context.shopRecord.id,
        kind: kind,
        url: fileUrl
      }
    });

    const response = {
      success: true,
      asset: {
        id: asset.id,
        kind: asset.kind as "logo" | "banner",
        url: asset.url,
        filename: file.name
      },
      message: `${kind} uploaded successfully`
    };

    // Validate response schema
    const validatedResponse = UploadResponseSchema.parse(response);
    return json(validatedResponse);

  } catch (error) {
    console.error('Upload API error:', error);
    
    if (error instanceof Response) {
      throw error; // Re-throw middleware responses
    }

    return json(createErrorResponse(
      error instanceof Error ? error.message : 'Upload failed',
      'UPLOAD_ERROR'
    ), { status: 500 });
  }
}
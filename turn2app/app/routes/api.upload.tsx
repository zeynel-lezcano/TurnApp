import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { flexibleAuth, logRequest } from '../lib/middleware.server';
import { rateLimitMiddleware } from '../lib/rate-limit.server';
import { prisma } from '../lib/prisma.server';
import { 
  UploadRequestSchema, 
  UploadResponseSchema,
  createErrorResponse 
} from '../lib/validation.server';
import { randomBytes } from 'node:crypto';

// File validation constants
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'image/svg+xml'
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Simple file upload handler that works in both dev and production
 * In production (Cloudflare), you should use R2 or external storage
 * In development, we just validate and return a mock URL
 */
async function handleFileUpload(file: File): Promise<string> {
  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}`);
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Generate secure filename
  const ext = file.name.split('.').pop() || '';
  const randomId = randomBytes(8).toString('hex');
  const timestamp = Date.now();
  const filename = `${timestamp}-${randomId}.${ext}`;

  // For development: Return mock URL
  // For production: Upload to Cloudflare R2 or external storage
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement actual upload to Cloudflare R2
    // Example: await uploadToR2(file, filename);
    return `/uploads/${filename}`;
  }

  // Development: Just return the URL (file will be handled client-side for now)
  return `/uploads/${filename}`;
}

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

    // Parse form data
    const formData = await request.formData();
    
    const file = formData.get('file') as File | null;
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

    // Handle file upload
    const fileUrl = await handleFileUpload(file);

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
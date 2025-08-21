import type { ActionFunctionArgs } from '@remix-run/node';
import { json, unstable_parseMultipartFormData, unstable_createFileUploadHandler } from '@remix-run/node';
import { getOptionalSession } from '~/lib/session.server';
import { prisma } from '~/lib/prisma.server';
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
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Auth check - session or shop param
    const sessionContext = await getOptionalSession(request);
    let shop: string;
    
    if (sessionContext) {
      shop = sessionContext.shop;
    } else {
      const url = new URL(request.url);
      const shopParam = url.searchParams.get('shop');
      if (!shopParam) {
        return json({ error: 'Unauthorized' }, { status: 401 });
      }
      shop = shopParam;
    }

    // Verify shop exists
    const shopRecord = await prisma.shop.findUnique({
      where: { shopDomain: shop }
    });

    if (!shopRecord) {
      return json({ error: 'Shop not found' }, { status: 404 });
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
    const kind = (formData.get('kind') as string) || 'logo';

    if (!file) {
      return json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate kind
    if (!['logo', 'banner'].includes(kind)) {
      return json({ 
        error: 'Invalid asset kind. Must be "logo" or "banner"' 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 });
    }

    // Get file URL (file.name contains the generated filename)
    const fileUrl = `/uploads/${file.name}`;

    // Delete existing asset of same kind
    const existingAsset = await prisma.asset.findFirst({
      where: {
        shopId: shopRecord.id,
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
        shopId: shopRecord.id,
        kind: kind,
        url: fileUrl
      }
    });

    return json({
      success: true,
      asset: {
        id: asset.id,
        kind: asset.kind,
        url: asset.url,
        filename: file.name
      },
      message: `${kind} uploaded successfully`
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }, { status: 500 });
  }
}
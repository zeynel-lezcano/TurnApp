import { createHmac } from "node:crypto";
import { buildWebhookUrl } from './tunnel.server.js';

export function verifyWebhookHmac(
  body: string | Buffer, 
  hmacHeader: string,
  secret: string
): boolean {
  const bodyString = typeof body === 'string' ? body : body.toString('utf8');
  const calculatedHmac = createHmac('sha256', secret)
    .update(bodyString, 'utf8')
    .digest('base64');
  
  const providedHmac = hmacHeader.replace('sha256=', '');
  
  // Use timingSafeEqual to prevent timing attacks
  return timingSafeEqual(
    Buffer.from(calculatedHmac, 'base64'),
    Buffer.from(providedHmac, 'base64')
  );
}

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  
  return result === 0;
}

export interface WebhookRegistration {
  topic: string;
  address: string;
  format: 'json';
}

export async function registerWebhooks(
  shop: string,
  accessToken: string,
  baseUrl?: string
): Promise<void> {
  // Use tunnel-aware URL building if baseUrl not provided
  const getWebhookAddress = (path: string) => {
    if (baseUrl) {
      return `${baseUrl}${path}`;
    }
    return buildWebhookUrl(path);
  };

  const webhooks: WebhookRegistration[] = [
    {
      topic: 'app/uninstalled',
      address: getWebhookAddress('/webhooks/app_uninstalled'),
      format: 'json'
    },
    {
      topic: 'products/update',
      address: getWebhookAddress('/webhooks/products_update'), 
      format: 'json'
    }
  ];

  for (const webhook of webhooks) {
    try {
      const response = await fetch(`https://${shop}/admin/api/2024-01/webhooks.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ webhook })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Webhook registered: ${webhook.topic}`, result.webhook?.id);
      } else {
        const error = await response.text();
        console.error(`Failed to register webhook ${webhook.topic}:`, error);
      }
    } catch (error) {
      console.error(`Error registering webhook ${webhook.topic}:`, error);
    }
  }
}

export async function unregisterWebhooks(
  shop: string,
  accessToken: string
): Promise<void> {
  try {
    // Get all webhooks for this app
    const response = await fetch(`https://${shop}/admin/api/2024-01/webhooks.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      }
    });

    if (response.ok) {
      const data = await response.json();
      const webhooks = data.webhooks || [];
      
      // Delete each webhook
      for (const webhook of webhooks) {
        await fetch(`https://${shop}/admin/api/2024-01/webhooks/${webhook.id}.json`, {
          method: 'DELETE',
          headers: {
            'X-Shopify-Access-Token': accessToken,
          }
        });
        console.log(`Webhook unregistered: ${webhook.topic} (${webhook.id})`);
      }
    }
  } catch (error) {
    console.error('Error unregistering webhooks:', error);
  }
}
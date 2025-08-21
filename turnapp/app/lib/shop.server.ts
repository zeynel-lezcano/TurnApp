import { prisma } from "~/lib/prisma.server";
import { decryptToken } from "~/lib/crypto.server";

export interface ShopWithToken {
  shopDomain: string;
  accessToken: string;
  installedAt: Date;
  uninstalledAt: Date | null;
  settings: any;
}

/**
 * Get shop with decrypted access token for API calls
 */
export async function getShopWithToken(shopDomain: string): Promise<ShopWithToken | null> {
  try {
    const shop = await prisma.shop.findUnique({
      where: { shopDomain }
    });

    if (!shop || shop.uninstalledAt) {
      return null;
    }

    // Decrypt the access token
    const accessToken = decryptToken(shop.accessTokenEnc);

    return {
      shopDomain: shop.shopDomain,
      accessToken,
      installedAt: shop.installedAt,
      uninstalledAt: shop.uninstalledAt,
      settings: shop.settings ? JSON.parse(shop.settings) : {}
    };
  } catch (error) {
    console.error('Failed to get shop with token:', error);
    return null;
  }
}

/**
 * Check if shop is installed and active
 */
export async function isShopActive(shopDomain: string): Promise<boolean> {
  try {
    const shop = await prisma.shop.findUnique({
      where: { shopDomain },
      select: { uninstalledAt: true }
    });

    return shop ? !shop.uninstalledAt : false;
  } catch (error) {
    console.error('Failed to check shop status:', error);
    return false;
  }
}

/**
 * Get shop settings without decrypting token
 */
export async function getShopSettings(shopDomain: string): Promise<any | null> {
  try {
    const shop = await prisma.shop.findUnique({
      where: { shopDomain },
      select: { settings: true, uninstalledAt: true }
    });

    if (!shop || shop.uninstalledAt) {
      return null;
    }

    return shop.settings ? JSON.parse(shop.settings) : {};
  } catch (error) {
    console.error('Failed to get shop settings:', error);
    return null;
  }
}
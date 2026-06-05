import { shopifyApi, ApiVersion } from '@shopify/shopify-api';

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || '',
  apiSecretKey: process.env.SHOPIFY_API_SECRET || '',
  scopes: ['read_products'],
  hostName: process.env.HOST || '',
  apiVersion: ApiVersion.October24,
  isEmbeddedApp: false,
});

export const getStorefrontData = async (query: string) => {
  const storefrontUrl = process.env.SHOPIFY_STOREFRONT_URL || '';
  const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';

  if (!storefrontUrl || !storefrontAccessToken) {
    console.warn('Shopify credentials missing. Ensure SHOPIFY_STOREFRONT_URL and SHOPIFY_STOREFRONT_ACCESS_TOKEN are set.');
    return null;
  }

  try {
    const response = await fetch(storefrontUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query }),
    });

    return await response.json();
  } catch (error) {
    console.error('Shopify Storefront API Error:', error);
    return null;
  }
};

export default shopify;

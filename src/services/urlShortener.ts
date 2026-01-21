/**
 * URL Shortener Service
 * Supports TinyURL (free, no API key) and Bitly (requires API key)
 */

type URLShortenerProvider = 'tinyurl' | 'bitly';

const CONFIG = {
  provider: (process.env.URL_SHORTENER_PROVIDER as URLShortenerProvider) || 'tinyurl',
  bitlyApiKey: process.env.BITLY_API_KEY || '',
};

/**
 * Shorten URL using TinyURL (no API key required)
 */
async function shortenWithTinyURL(longUrl: string): Promise<string> {
  const response = await fetch(
    `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`
  );

  if (!response.ok) {
    throw new Error(`TinyURL API error: ${response.status}`);
  }

  const shortUrl = await response.text();
  return shortUrl.trim();
}

/**
 * Shorten URL using Bitly (requires API key)
 */
async function shortenWithBitly(longUrl: string): Promise<string> {
  if (!CONFIG.bitlyApiKey) {
    throw new Error('Bitly API key not configured');
  }

  const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.bitlyApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      long_url: longUrl,
      domain: 'bit.ly',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Bitly API error: ${error.message || response.status}`);
  }

  const data = await response.json();
  return data.link;
}

/**
 * Shorten a URL using configured provider
 * Falls back to original URL if shortening fails
 */
export async function shortenURL(longUrl: string): Promise<string> {
  try {
    switch (CONFIG.provider) {
      case 'bitly':
        return await shortenWithBitly(longUrl);
      case 'tinyurl':
      default:
        return await shortenWithTinyURL(longUrl);
    }
  } catch (error) {
    console.error('URL shortening failed:', error);
    // Return original URL as fallback
    return longUrl;
  }
}

/**
 * Check if URL shortener is available
 */
export function isShortenerAvailable(): boolean {
  if (CONFIG.provider === 'bitly' && !CONFIG.bitlyApiKey) {
    return false;
  }
  return true;
}

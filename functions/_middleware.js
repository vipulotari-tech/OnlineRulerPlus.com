const CANONICAL_HOST = 'onlinerulerplus.com';

/**
 * Permanently redirect *.pages.dev and www.onlinerulerplus.com requests to https://onlinerulerplus.com.
 * Preserves path and query string, and keeps X-Robots-Tag: noindex on *.pages.dev responses.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();

  const isPagesDev =
    host === 'onlinerulerplus.pages.dev' ||
    host.endsWith('.onlinerulerplus.pages.dev');
  const isWww = host === `www.${CANONICAL_HOST}`;

  if (isPagesDev || isWww) {
    url.hostname = CANONICAL_HOST;
    url.protocol = 'https:';
    url.port = '';

    const headers = {
      Location: url.toString(),
      'Cache-Control': 'public, max-age=3600',
    };
    if (isPagesDev) {
      headers['X-Robots-Tag'] = 'noindex';
    }

    return new Response(null, {
      status: 301,
      headers,
    });
  }

  return context.next();
}

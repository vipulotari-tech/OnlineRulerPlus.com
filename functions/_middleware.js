/**
 * Block all page requests on *.pages.dev with 410 Gone and X-Robots-Tag: noindex, nofollow.
 * Leaves the custom domain (onlinerulerplus.com) unaffected with zero redirects.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();

  const isPagesDev =
    host === 'onlinerulerplus.pages.dev' ||
    host.endsWith('.onlinerulerplus.pages.dev');

  if (isPagesDev) {
    return new Response('410 Gone', {
      status: 410,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  return context.next();
}

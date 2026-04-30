import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env";

const BACKEND_URL = env.VITE_BACKEND_URL;

const HOP_BY_HOP = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "content-length",
  "accept-encoding",
  "content-encoding"
]);

interface HandlerCtx {
  request: Request;
  params: { _splat?: string };
}

async function proxy({ request, params }: HandlerCtx): Promise<Response> {
  const incomingUrl = new URL(request.url);
  const targetUrl = `${BACKEND_URL.replace(/\/$/, "")}/${params._splat ?? ""}${incomingUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };
  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  try {
    const incomingCookie = request.headers.get('cookie');
    console.log(`[PROXY REQUEST] ${request.method} ${targetUrl} - Cookie present: ${!!incomingCookie}`);
    if (incomingCookie) {
      console.log(`[PROXY REQUEST] Cookies: ${incomingCookie.split(';').map(c => c.split('=')[0].trim()).join(', ')}`);
    }

    const upstream = await fetch(targetUrl, init);
    const respHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') return;
      if (!HOP_BY_HOP.has(key.toLowerCase())) respHeaders.set(key, value);
    });
    
    console.log(`[PROXY RESPONSE] ${request.method} ${targetUrl} - Status: ${upstream.status}`);
    
    // Function to sanitize cookies for local development
    const sanitizeCookie = (cookie: string) => {
      return cookie
        .split(';')
        .map(part => part.trim())
        .filter(part => {
          const lowerPart = part.toLowerCase();
          // Strip Secure flag (needed for http://localhost)
          if (lowerPart === 'secure') return false;
          // Strip Domain attribute (can interfere with localhost)
          if (lowerPart.startsWith('domain=')) return false;
          // Strip SameSite=None (requires Secure)
          if (lowerPart === 'samesite=none') return false;
          return true;
        })
        .join('; ') + '; SameSite=Lax';
    };

    if (typeof upstream.headers.getSetCookie === 'function') {
      const cookies = upstream.headers.getSetCookie();
      for (const cookie of cookies) {
        const cleanCookie = sanitizeCookie(cookie);
        console.log(`[PROXY] Sanitized Cookie: ${cleanCookie.split(';')[0]}...`);
        respHeaders.append('set-cookie', cleanCookie);
      }
    } else {
      const cookie = upstream.headers.get('set-cookie');
      if (cookie) {
        const cleanCookie = sanitizeCookie(cookie);
        respHeaders.append('set-cookie', cleanCookie);
      }
    }
    
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: respHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        message: `Backend unreachable at ${targetUrl}. Configure BACKEND_URL env var.`,
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const Route = createFileRoute("/api/backend/$")({
  server: {
    handlers: {
      GET: proxy,
      POST: proxy,
      PUT: proxy,
      PATCH: proxy,
      DELETE: proxy,
      OPTIONS: proxy,
    },
  },
} as never);

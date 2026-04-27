import { createFileRoute } from "@tanstack/react-router";

// Catch-all proxy from /api/backend/* to the NestJS backend.
// Set VITE_BACKEND_URL (and the matching server-side BACKEND_URL) to your NestJS
// base, e.g. https://api.example.com/api/v1. Defaults to http://localhost:3000/api/v1.
const BACKEND_URL =
  // server runtime
  (typeof process !== "undefined" && process.env?.BACKEND_URL) ||
  "http://localhost:3000/api/v1";

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
]);

async function proxy(request: Request, splat: string | undefined) {
  const incomingUrl = new URL(request.url);
  const targetUrl = `${BACKEND_URL.replace(/\/$/, "")}/${splat ?? ""}${incomingUrl.search}`;

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
    const upstream = await fetch(targetUrl, init);
    const respHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) respHeaders.set(key, value);
    });
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
      GET: ({ request, params }) => proxy(request, params._splat),
      POST: ({ request, params }) => proxy(request, params._splat),
      PUT: ({ request, params }) => proxy(request, params._splat),
      PATCH: ({ request, params }) => proxy(request, params._splat),
      DELETE: ({ request, params }) => proxy(request, params._splat),
      OPTIONS: ({ request, params }) => proxy(request, params._splat),
    },
  },
});

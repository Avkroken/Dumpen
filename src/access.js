import app from "./index.js";
import { publicPage } from "./public-page.js";

const ADMIN_API_PREFIX = "/admin/api/";
const LEGACY_API_PREFIX = "/api/";
const PRIVILEGED_API_ROOTS = new Set(["objects", "tickets", "download"]);

function privilegedSuffix(pathname, prefix) {
  if (!pathname.startsWith(prefix)) return null;
  const suffix = pathname.slice(prefix.length);
  const root = suffix.split("/", 1)[0];
  return PRIVILEGED_API_ROOTS.has(root) ? suffix : null;
}

export function accessRoute(pathname, method = "GET") {
  const upperMethod = method.toUpperCase();
  if (pathname === "/" && (upperMethod === "GET" || upperMethod === "HEAD")) {
    return { type: "public-page", pathname };
  }

  const adminSuffix = privilegedSuffix(pathname, ADMIN_API_PREFIX);
  if (adminSuffix !== null) {
    return { type: "rewrite", pathname: `${LEGACY_API_PREFIX}${adminSuffix}` };
  }

  const legacySuffix = privilegedSuffix(pathname, LEGACY_API_PREFIX);
  if (legacySuffix !== null) {
    return { type: "redirect", pathname: `${ADMIN_API_PREFIX}${legacySuffix}` };
  }

  return { type: "pass", pathname };
}

function requestWithPath(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url, request);
}

function publicResponse(method) {
  const body = method.toUpperCase() === "HEAD" ? null : publicPage();
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const route = accessRoute(new URL(request.url).pathname, request.method);

    if (route.type === "public-page") {
      return publicResponse(request.method);
    }

    if (route.type === "redirect") {
      const target = new URL(request.url);
      target.pathname = route.pathname;
      return new Response(null, {
        status: 308,
        headers: {
          location: target.toString(),
          "cache-control": "no-store",
        },
      });
    }

    const upstreamRequest = route.type === "rewrite"
      ? requestWithPath(request, route.pathname)
      : request;
    return app.fetch(upstreamRequest, env, ctx);
  },
};

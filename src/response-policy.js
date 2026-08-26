const COMMON_HEADERS = {
  "content-security-policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "same-origin",
};

export function applyResponsePolicy(response, { noStore = false } = {}) {
  const result = new Response(response.body, response);
  for (const [name, value] of Object.entries(COMMON_HEADERS)) {
    result.headers.set(name, value);
  }
  if (noStore) {
    result.headers.set("cache-control", "no-store, max-age=0");
    result.headers.set("pragma", "no-cache");
  }
  return result;
}

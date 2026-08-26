import app from "./worker.js";
import { applyResponsePolicy } from "./response-policy.js";

function isAdminPath(pathname) {
  return pathname === "/admin" || pathname === "/admin.html" || pathname.startsWith("/api/admin/");
}

export default {
  async fetch(request, env, ctx) {
    const response = await app.fetch(request, env, ctx);
    const pathname = new URL(request.url).pathname;
    return applyResponsePolicy(response, { noStore: isAdminPath(pathname) });
  },
};

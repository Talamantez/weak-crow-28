// routes/_middleware.ts
import { FreshContext } from "$fresh/server.ts";

export async function handler(
  req: Request,
  ctx: FreshContext,
) {
  // Log the incoming request URL
  console.log(`[Middleware] Request URL: ${req.url}`);

  // Log the destination of the request
  console.log(`[Middleware] Destination: ${ctx.destination}`);

  // Pass the request to the next handler
  const resp = await ctx.next();

  // Set the appropriate MIME types based on the file extension
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname.endsWith(".js")) {
    resp.headers.set("Content-Type", "application/javascript");
  } else if (pathname.endsWith(".js.map")) {
    resp.headers.set("Content-Type", "application/json");
  }

  return resp;
}
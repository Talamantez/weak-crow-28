// routes/_middleware.ts
import { FreshContext } from "$fresh/server.ts";
import { serveDir } from "https://deno.land/std@0.140.0/http/file_server.ts";

const staticDir = "static";

export async function handler(req: Request, ctx: FreshContext) {
  // Log the incoming request URL
  console.log(`[Middleware] Request URL: ${req.url}`);

  // Log the destination of the request
  console.log(`[Middleware] Destination: ${ctx.destination}`);

  // Block all '.php' requests
  const url = new URL(req.url);
  const pathname = url.pathname;
  if (pathname.endsWith(".php")) {
    return new Response("Access denied. PHP requests are not allowed.", {
      status: 403,
    });
  }

  // Pass the request to the next handler
  const resp = await ctx.next();

  // Set the appropriate MIME types based on the file extension
  if (pathname.endsWith(".js")) {
    resp.headers.set("Content-Type", "application/javascript");
  } else if (pathname.endsWith(".js.map")) {
    resp.headers.set("Content-Type", "application/json");
  }

  // Serve static files
  if (pathname.startsWith("/static/")) {
    return await serveDir(req, {
      fsRoot: staticDir,
      urlRoot: "static",
      showDirListing: true,
      enableCors: true,
    });
  }

  return resp;
}
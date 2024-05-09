/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

// const port = 8080;

// const handler = (request: Request): Response => {
//   const body = `Your user-agent is:\n\n${
//     request.headers.get("user-agent") ?? "Unknown"
//   }`;

//   return new Response(body, { status: 200 });
// };

// console.log(`HTTP server running. Access it at: http://localhost:8080/`);
// Deno.serve({ port }, handler);

import { serveDir } from "https://deno.land/std@0.140.0/http/file_server.ts";

const port = 8080;
const staticDir = "static";

const handler = async (request: Request): Promise<Response> => {
  const pathname = new URL(request.url).pathname;

  // Serve static files
  if (pathname.startsWith("/static/")) {
    return await serveDir(request, {
      fsRoot: staticDir,
      urlRoot: "static",
      showDirListing: true,
      enableCors: true,
    });
  }

  // Dynamic request handling
  const body = `Your user-agent is:\n\n${
    request.headers.get("user-agent") ?? "Unknown"
  }`;
  return new Response(body, { status: 200 });
};

console.log(`HTTP server running. Access it at: http://localhost:${port}/`);
Deno.serve({ port }, handler);

// import { cache } from "https://deno.land/x/cache/mod.ts";

// const cache = new Cache()
// const chapterResponse = new Response;
// chapterResponse.

// const chapters = await cache.put("chapters", new Response);
  
// async () => {
//     const res = await fetch("./static/chapters.json");
//     return await res.json();
//   }

//   const introduction = await cache.put("introduction", async () => {
//     const res = await fetch("./static/introduction.json");
//     return await res.json();
//   });

// Deno.serve((_req) => {
//     const url = new URL(_req.url)
//     if (url.pathname === "/api/chapters") {
//         return new Response(JSON.stringify(chapters), {
//           headers: { "Content-Type": "application/json" },
//         });
//       }
    
//       if (url.pathname === "/api/introduction") {
//         return new Response(JSON.stringify(introduction), {
//           headers: { "Content-Type": "application/json" },
//         });
//       }
// })

//   serve(async (req) => {
//     const url = new URL(req.url);
  
//     if (url.pathname === "/api/chapters") {
//       return new Response(JSON.stringify(chapters), {
//         headers: { "Content-Type": "application/json" },
//       });
//     }
  
//     if (url.pathname === "/api/introduction") {
//       return new Response(JSON.stringify(introduction), {
//         headers: { "Content-Type": "application/json" },
//       });
//     }
  
//     // Other server logic
//   }, { port: 8000 });

await start(manifest, { plugins: [twindPlugin(twindConfig)] });

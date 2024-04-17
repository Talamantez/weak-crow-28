// routes/_middleware.ts

import { HandlerContext } from "$fresh/server.ts";
import renderChapter from "../services/renderChapter.ts";
import { PDFDocument, rgb, StandardFonts } from "https://cdn.skypack.dev/pdf-lib@^1.11.1?dts";


export async function handler(req: Request, ctx: HandlerContext) {
    // Polyfill for Object.hasOwn()
    if (typeof Object.hasOwn !== 'function') {
      Object.hasOwn = function (obj: object, prop: PropertyKey) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      };
    }
  
    // Continue to the next middleware or route handler
    const resp = await ctx.next();
    return resp;
  }

  export async function doPrintChapter(json) {
    // Read the 'chapters.json' file
    // const jsonContent = await Deno.readTextFile("static/introduction.json");
    // const jsonContent = req.body
    console.log(await json)
    if(!json) {
      return new Response("No request body found", { status: 400 });
    }
    await renderChapter(json)
    return new Response("Chapter printed", { status: 200 });
  }
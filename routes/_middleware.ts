// routes/_middleware.ts

import { HandlerContext } from "$fresh/server.ts";

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
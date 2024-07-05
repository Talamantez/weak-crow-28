import { Handlers } from "$fresh/server.ts";
import { handler as pdfHandler } from "./printAllChapters.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    return await pdfHandler.POST(req, ctx);
  },
};
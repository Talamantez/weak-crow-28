// routes/api/upload.ts
import { Handlers } from "$fresh/server.ts";
import { encode } from "https://deno.land/std@0.152.0/encoding/base64.ts";

export const handler: Handlers = {
  async POST(req) {
    const form = await req.formData();
    const file = form.get("image") as File;
    const imageData = await file.arrayBuffer();
    const base64Encoded = encode(new Uint8Array(imageData));
    const imageUrl = `data:${file.type};base64,${base64Encoded}`;
    return new Response(JSON.stringify({ url: imageUrl }));
  },
};
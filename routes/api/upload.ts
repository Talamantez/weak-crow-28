// routes/api/upload.ts

import { Handlers } from "$fresh/server.ts";
import { Logger } from "../../util/logger.ts";
import { ensureDir } from "https://deno.land/std@0.181.0/fs/ensure_dir.ts";
import { join } from "https://deno.land/std@0.181.0/path/mod.ts";

export const handler: Handlers = {
  async POST(req) {
    const functionId = crypto.randomUUID();
    Logger.info(`[${functionId}] Upload request received`);

    try {
      const formData = await req.formData();
      const image = formData.get("image") as File;

      if (!image) {
        Logger.warn(`[${functionId}] No image file in request`);
        return new Response("No image file uploaded", { status: 400 });
      }

      Logger.info(`[${functionId}] Image received: ${image.name}, size: ${image.size} bytes, type: ${image.type}`);

      // Ensure the upload directory exists
      const uploadDir = join(Deno.cwd(), "static", "uploads");
      await ensureDir(uploadDir);

      // Generate a unique filename
      const fileName = `${crypto.randomUUID()}-${image.name}`;
      const filePath = join(uploadDir, fileName);

      // Write the file
      const arrayBuffer = await image.arrayBuffer();
      await Deno.writeFile(filePath, new Uint8Array(arrayBuffer));

      Logger.info(`[${functionId}] Image saved to ${filePath}`);

      // Generate the URL for the uploaded image
      const imageUrl = `/uploads/${fileName}`;

      return new Response(JSON.stringify({ url: imageUrl }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      Logger.error(`[${functionId}] Error processing upload:`, error);
      return new Response("Error processing upload", { status: 500 });
    }
  },
};
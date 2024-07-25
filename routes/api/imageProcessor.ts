// imageProcessor.ts
import * as canvas from "https://deno.land/x/canvas@v1.4.1/mod.ts";

export async function resizeImage(imageUrl: string, targetWidth: number, targetHeight: number): Promise<Uint8Array> {
  // Fetch the image
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();

  // Create an image from the array buffer
  const img = new canvas.Image();
  img.src = arrayBuffer;
  await new Promise((resolve) => img.onload = resolve);

  // Create a canvas with the target dimensions
  const canvasElement = canvas.createCanvas(targetWidth, targetHeight);
  const ctx = canvasElement.getContext("2d");

  // Calculate scaling
  const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;

  // Draw the image on the canvas, centered and cropped to fill
  ctx.drawImage(
    img,
    (targetWidth - scaledWidth) / 2,
    (targetHeight - scaledHeight) / 2,
    scaledWidth,
    scaledHeight
  );

  // Convert the canvas to a PNG buffer
  return canvasElement.toBuffer("image/png");
}
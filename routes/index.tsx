import * as base58 from "$std/encoding/base58.ts";

export const handler = (req: Request ): Response => {
  const listId = base58.encode(crypto.getRandomValues(new Uint8Array(8)));
  const url = new URL(req.url);
  return Response.redirect(`${url.origin}/${listId}`, 302);
};

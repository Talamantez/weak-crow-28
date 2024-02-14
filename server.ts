import { Application } from "https://deno.land/x/oak/mod.ts";
const app  = new Application();
const PORT = 3000;
app.listen({ port: PORT });
console.log(`Server listening on port ${PORT}`);
import { Head } from "$fresh/runtime.ts";
import { Handlers } from "$fresh/server.ts";
import Hero from "../components/Hero.tsx";
import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";
import TodoListView from "../islands/TodoListView.tsx";
import {
  db,
  inputSchema,
  loadList,
  postImage,
  writeItems,
} from "../services/database.ts";
import { TodoList } from "../shared/api.ts";

export const handler: Handlers = {
  GET: async (req, ctx) => {
    const listId = ctx.params.listId;
    const accept = req.headers.get("accept");
    const url = new URL(req.url);

    if (accept === "text/event-stream") {
      const stream = db.watch([["list_updated", listId]]).getReader();
      const body = new ReadableStream({
        async start(controller) {
          console.log(
            `Opened stream for list ${listId} remote ${
              JSON.stringify(ctx.remoteAddr)
            }`,
          );
          while (true) {
            try {
              if ((await stream.read()).done) {
                return;
              }

              const data = await loadList(listId, "strong");
              const chunk = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(new TextEncoder().encode(chunk));
            } catch (e) {
              console.error(`Error refreshing list ${listId}`, e);
            }
          }
        },
        cancel() {
          stream.cancel();
          console.log(
            `Closed stream for list ${listId} remote ${
              JSON.stringify(ctx.remoteAddr)
            }`,
          );
        },
      });
      return new Response(body, {
        headers: {
          "content-type": "text/event-stream",
        },
      });
    }

    const startTime = Date.now();
    const data = await loadList(
      listId,
      url.searchParams.get("consistency") === "strong" ? "strong" : "eventual",
    );
    const endTime = Date.now();
    const res = await ctx.render({ data, latency: endTime - startTime });
    res.headers.set("x-list-load-time", "" + (endTime - startTime));
    return res;
  },
  POST: async (req, ctx) => {
    const listId = ctx.params.listId;
    const rawObjectArray = await req.json();
    // let myImgUrl = 'static\\screenshot.png'
    console.log("rawObjectArray: ", rawObjectArray);
    let body = inputSchema.parse(rawObjectArray);

    // Send an image to gcp:
    // if the image object has an imgUrl, try to post that image to gcp
    // if it succeeds, copy the image's gcp url to the body of
    // the post request
    // if not return the raw object

    // const myImgUrl = "static\\Bernadine-1_Bush-Medicine-Leaves.jpg"
    const myImgUrl = rawObjectArray[0].imgUrl;
    // const myRelativeImgUrl = myImgUrl.replace("http://localhost:8000", "");
    const freshUrl = URL.createObjectURL(myImgUrl)
    console.log("POST [listid].tsx myImgUrl: ", freshUrl);
    
      // postImage(`static\\screenshot.png`);
      // embedImage();
    const postResponse = await postImage(freshUrl);
    console.log(`postResponse: `);
    console.dir(postResponse);
    if (!postResponse || !postResponse.name ) {
      body = inputSchema.parse(rawObjectArray);
      await writeItems(listId, body);
      return Response.json({ ok: false });
    };
    const updatedObject = {
      ...rawObjectArray[0],
      imgUrl: `https://storage.googleapis.com/nami-resource-roadmap/${postResponse.name}`
    };
    const updatedObjectArray = [];
    updatedObjectArray.push(updatedObject);

    body = inputSchema.parse(updatedObjectArray);
    await writeItems(listId, body);
    return Response.json({ ok: true });
  },
};

export default function Home(
  { data: { data, latency } }: { data: { data: TodoList; latency: number } },
) {
  return (
    <>
      <Head>
        <title>Roadmap</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="/script.js" defer></script>
        <link rel="stylesheet" href="/style.css" />
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <Header active="Home" />
        <Hero />
        <TodoListView initialData={data} latency={latency} />
        <Footer />
      </div>
    </>
  );
}

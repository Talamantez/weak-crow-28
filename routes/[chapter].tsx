import { Head } from "$fresh/runtime.ts";
import { PageProps } from "$fresh/server.ts";
import ChapterData from "../islands/ChapterData.tsx";

export default function Chapter(props: PageProps) {
  return (
    <>
      <Head>
        <title>{props.params.chapter.split("%20").join(" ")}</title>
      </Head>
      <main class="flex flex-col items-center justify-start my-10 p-4 mx-auto max-w-screen-lg">
        <ChapterData title={props.params.chapter.split("%20").join(" ")} />
      </main>
    </>
  );
}

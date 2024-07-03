import { Head } from "$fresh/runtime.ts";
import { PageProps } from "$fresh/server.ts";
import ChapterEditor from "../islands/ChapterEditor.tsx";
// import ChapterView from "../islands/ChapterView.tsx";

export default function Chapter(props: PageProps) {
  return (
    <>
      <Head>
        <title>{props.params.chapter.split("%20").join(" ")}</title>
      </Head>
      <main class="flex flex-col items-center justify-start my-10 p-4 mx-auto max-w-screen-lg">
        {/* <ChapterView title={props.params.chapter.split("%20").join(" ")} /> */}
      <ChapterEditor chapter={"Introduction"} onUpdate={console.log('TODO OnUpdate')}/>
      </main>
    </>
  );
}

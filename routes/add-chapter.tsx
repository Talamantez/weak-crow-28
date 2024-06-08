import { Head } from "$fresh/runtime.ts";
import AddChapter from "../islands/AddChapter.tsx";

export default function NewChapter() {
  return (
    <>
      <Head>
        <title>Resource Roadmap | Add Chapter</title>
      </Head>
      <main class="flex flex-col items-center justify-center mx-auto max-w-screen-lg h-screen">
        <h1 class="text-2xl">Add Chapter</h1>
        <AddChapter />
      </main>
    </>
  );
}

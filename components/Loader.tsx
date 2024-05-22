// Loader.tsx

export default function Loader() {
  return (
    <div class="flex flex-col items-center justify-center h-screen">
      <div
        class="w-10 h-10 border-4 border-gray-300 border-t-4 border-t-blue-500 rounded-full animate-spin"
      ></div>
      <p class="mt-4">Loading...</p>
    </div>
  );
}
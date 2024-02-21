import LemonIcon from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/lemon-2.tsx";

export default function Footer() {
  const menus = [
    {
      title: "Documentation",
      children: [
        { name: "Getting Started", href: "#" },
        { name: "Guide", href: "#" },
        { name: "API", href: "#" },
        { name: "Showcase", href: "#" },
        { name: "Pricing", href: "#" },
      ],
    },
    {
      title: "Community",
      children: [
        { name: "Forum", href: "#" },
        { name: "Discord", href: "#" },
      ],
    },
  ];

  return (
    <div class="bg-white flex flex-col md:flex-row w-full max-w-screen-lg gap-8 md:gap-16 px-8 py-8 text-sm">
      <div class="flex-1">
        <div class="flex items-center gap-1">
          <image src="https://consciousrobot-956159009.imgix.net/logo.png" />
          <div class="font-bold text-2xl">
            NAMI
          </div>
        </div>
        <div class="text-gray-500">
          Resource Roadmap
        </div>
      </div>

      <div class="text-gray-500 space-y-2">
        <div class="text-xs">
          Copyright © 2024 NAMI Seattle<br />
        </div>
      </div>
    </div>
  );
}
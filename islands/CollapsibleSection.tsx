import { useEffect } from "preact/hooks";
import IconChevronDown from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/chevron-down.tsx";
import IconChevronUp from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/chevron-up.tsx";

export const CollapsibleSection = ({ id, title, children, isExpanded, onToggle }) => {
  useEffect(() => {
    const storedState = localStorage.getItem(`section_${id}`);
    if (storedState !== null) {
      onToggle(id, storedState === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(`section_${id}`, isExpanded.toString());
  }, [id, isExpanded]);

  return (
    <div class='mb-4 border border-gray-200 rounded-lg overflow-hidden'>
      <button
        class='flex justify-between items-center w-full p-4 text-left bg-gray-100 hover:bg-gray-200'
        onClick={() => onToggle(id, !isExpanded)}
      >
        <h3 class={`text-lg font-semibold`}>{title}</h3>
        {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
      </button>
      {isExpanded && <div class={`p-4`}>{children}</div>}
    </div>
  );
};
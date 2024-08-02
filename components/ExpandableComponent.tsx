import { useState } from "preact/hooks";
import IconChevronUp from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/chevron-up.tsx";
import IconChevronDown from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/chevron-down.tsx";
import { highlightSearchTerm } from "./highlightSearchTerm.tsx";

const Expandable = (
  {
    children,
    title,
    searchTerm,
    defaultExpanded = false,
  },
) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border rounded-md mb-4">
      <div className="flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200">
        <div className="flex-grow cursor-pointer" onClick={toggleExpand}>
          <h3 className="font-semibold">
            {highlightSearchTerm(title, searchTerm)}
          </h3>
        </div>
        <div className="flex items-center">
          {isExpanded
            ? (
              <IconChevronUp
                className="w-5 h-5 cursor-pointer"
                onClick={toggleExpand}
              />
            )
            : (
              <IconChevronDown
                className="w-5 h-5 cursor-pointer"
                onClick={toggleExpand}
              />
            )}
        </div>
      </div>
      {isExpanded && <div className="p-4">{children}</div>}
    </div>
  );
};

export default Expandable;

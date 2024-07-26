import { useState } from "preact/hooks";
import IconChevronUp from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/chevron-up.tsx";
import IconChevronDown from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/chevron-down.tsx";
const Expandable = ({ children, title, defaultExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
    const toggleExpand = () => {
      setIsExpanded(!isExpanded);
    };
  
    return (
      <div className="border rounded-md mb-4">
        <div
          className="flex justify-between items-center p-4 cursor-pointer bg-gray-100 hover:bg-gray-200"
          onClick={toggleExpand}
        >
          <h3 className="font-semibold">{title}</h3>
          {isExpanded ? (
            <IconChevronUp class="w-5 h-5" />
          ) : (
            <IconChevronDown class="w-5 h-5" />
          )}
        </div>
        {isExpanded && <div class="p-4">{children}</div>}
      </div>
    );
  };
  
  export default Expandable;
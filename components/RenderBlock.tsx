import { useState } from "preact/hooks";
import Button from "./Button.tsx";
import IconEdit from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/edit.tsx";
import { Block } from "../util/types.ts";
import { highlightSearchTerm } from "./highlightSearchTerm.tsx";

const RenderBlock = ({
    block,
    onDelete,
    isActive,
    setActiveBlock,
    updateBlock,
    myIndex,
    searchTerm
  }: {
    block: Block;
    onDelete: () => void;
    isActive: boolean;
    setActiveBlock: (id: string | null) => void;
    updateBlock: (index: number, updatedBlock: Block) => void;
    myIndex: number;
    searchTerm: string;
  }) => {
    const [isEditingBlock, setIsEditingBlock] = useState(false);
    let newValue = block.text;
  
    const toggleIsEditingBlock = () => {
      setIsEditingBlock(!isEditingBlock);
    };
  
    const handleSaveBlock = () => {
      updateBlock(myIndex, {
        ...block,
        text: newValue,
      });
      setIsEditingBlock(false);
    };
  
    const handleCancelEdit = () => {
      setIsEditingBlock(false);
    };
  
    const handleChange = (e) => {
      // setTempText((e.target as HTMLInputElement).value);
      newValue = (e.target as HTMLInputElement).value;
    };
  
    const baseClasses = "mb-2 p-2 rounded";
    const isEditingClasses = "bg-purple-200 text-purple-800";
  
    if (!block.type) {
      return null;
    } else if (block.type === "paragraph") {
      return (
        <>
          {isEditingBlock
            ? (
              <div>
                <div
                  class={`flex items-center ${baseClasses}`}
                >
                  <p class={`flex-grow ${isEditingClasses}`}>{highlightSearchTerm(block.text, searchTerm)}</p>
                  <Button
                    text=""
                    onClick={() => toggleIsEditingBlock()}
                    styles="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                    icon={IconEdit}
                  />
                  <Button
                    text="Delete"
                    onClick={onDelete}
                    styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 ml-2"
                  />
                </div>
                <input
                  type="text"
                  value={highlightSearchTerm(block.text,searchTerm)}
                  onChange={(e) => handleChange(e)}
                  class="w-full p-2 border-2 border-blue-500 rounded mb-2 focus:(outline-none ring-4 ring-yellow-400)"
                  onFocus={() => setActiveBlock(block.id)}
                />
  
                <Button
                  text="Save"
                  onClick={handleSaveBlock}
                  styles="bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2 mr-2"
                />
                <Button
                  text="Cancel"
                  onClick={handleCancelEdit}
                  styles="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2"
                />
              </div>
            )
            : ((
              <div
                class={`flex items-center ${baseClasses}`}
              >
                <p class={`flex-grow`}>{highlightSearchTerm(block.text,searchTerm)}</p>
                <Button
                  text=""
                  onClick={() => toggleIsEditingBlock()}
                  styles="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                  icon={IconEdit}
                />
                <Button
                  text="Delete"
                  onClick={onDelete}
                  styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 ml-2"
                />
              </div>
            ))}
        </>
      );
    } else if (block.type === "header") {
      return (
        <>
          {isEditingBlock
            ? (
              <div>
                <div
                  class={`flex items-center ${baseClasses}`}
                >
                  <h3 class={`text-xl font-bold flex-grow ${isEditingClasses}`}>
                    {highlightSearchTerm(block.text, searchTerm)}
                  </h3>
                  <Button
                    text=""
                    onClick={() => toggleIsEditingBlock()}
                    styles="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                    icon={IconEdit}
                  />
                  <Button
                    text="Delete"
                    onClick={onDelete}
                    styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 ml-2"
                  />
                </div>
                <input
                  type="text"
                  value={highlightSearchTerm(block.text,searchTerm)}
                  onChange={(e) => handleChange(e)}
                  class="w-full p-2 border-2 border-blue-500 rounded mb-2 focus:(outline-none ring-4 ring-yellow-400)"
                />
  
                <Button
                  text="Save"
                  onClick={handleSaveBlock}
                  styles="bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2 mr-2"
                />
                <Button
                  text="Cancel"
                  onClick={handleCancelEdit}
                  styles="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2"
                />
              </div>
            )
            : ((
              <div
                class={`flex items-center ${baseClasses}`}
              >
                <h3 class={`text-xl font-bold flex-grow`}>
                  {highlightSearchTerm(block.text,searchTerm)}
                </h3>
                <Button
                  text=""
                  onClick={() => toggleIsEditingBlock()}
                  styles="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                  icon={IconEdit}
                />
                <Button
                  text="Delete"
                  onClick={onDelete}
                  styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 ml-2"
                />
              </div>
            ))}
        </>
      );
    } else if (block.type === "unordered-list-item") {
      return (
        <>
          {isEditingBlock
            ? (
              <div>
                <div
                  class={`flex items-center ${baseClasses}`}
                >
                  <li class={`flex-grow ${isEditingClasses}`}>{highlightSearchTerm(block.text, searchTerm)}</li>
                  <Button
                    text=""
                    onClick={() => toggleIsEditingBlock()}
                    styles="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                    icon={IconEdit}
                  />
                  <Button
                    text="Delete"
                    onClick={onDelete}
                    styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 ml-2"
                  />
                </div>
                <input
                  type="text"
                  value={highlightSearchTerm(block.text,searchTerm)}
                  onChange={(e) => handleChange(e)}
                  class="w-full p-2 border-2 border-blue-500 rounded mb-2 focus:(outline-none ring-4 ring-yellow-400)"
                />
  
                <Button
                  text="Save"
                  onClick={handleSaveBlock}
                  styles="bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2 mr-2"
                />
                <Button
                  text="Cancel"
                  onClick={handleCancelEdit}
                  styles="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2"
                />
              </div>
            )
            : ((
              <div
                class={`flex items-center ${baseClasses}`}
              >
                <li class={`flex-grow`}>{highlightSearchTerm(block.text, searchTerm)}</li>
                <Button
                  text=""
                  onClick={() => toggleIsEditingBlock()}
                  styles="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                  icon={IconEdit}
                />
                <Button
                  text="Delete"
                  onClick={onDelete}
                  styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 ml-2"
                />
              </div>
            ))}
        </>
      );
    }
  };

  export default RenderBlock;
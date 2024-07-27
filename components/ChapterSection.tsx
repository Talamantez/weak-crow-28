import { useState } from "preact/hooks";
import Button from "./Button.tsx";
import IconEdit from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/edit.tsx";
import { Block, Section } from "../util/types.ts";
import RenderBlock from "./RenderBlock.tsx";
import AddBlockButton from "./AddBlockButton.tsx";
import Expandable from "./ExpandableComponent.tsx";
import { highlightSearchTerm } from "./highlightSearchTerm.tsx";

const ChapterSection = ({
    section,
    depth = 1,
    onUpdate,
    onDelete,
    activeBlock,
    setActiveBlock,
    chapterIndex,
    sectionIndex,
    searchTerm,
}: {
    section: Section;
    depth?: number;
    onUpdate: (updatedSection: Section) => void;
    onDelete: () => void;
    activeBlock: string | null;
    setActiveBlock: (id: string | null) => void;
    chapterIndex: string;
    sectionIndex: number;
    searchTerm: string;
}) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(section.title);

    const toggleIsEditingTitle = () => {
        setIsEditingTitle(!isEditingTitle);
    };

    const handleTitleChange = (e: Event) => {
        const newTitle = (e.target as HTMLInputElement).value;
        setTitle(newTitle);
    };

    const handleTitleSave = () => {
        onUpdate({ ...section, title });
        setIsEditingTitle(false);
    };

    const HeadingTag = `h${
        Math.min(depth + 2, 6)
    }` as keyof JSX.IntrinsicElements;

    const addBlock = (type: string) => {
        const newBlock: Block = { type, text: `New ${type}` };
        const updatedDescription = section.description
            ? { blocks: [...section.description.blocks, newBlock] }
            : { blocks: [newBlock] };
        onUpdate({ ...section, description: updatedDescription });
    };

    const updateBlock = (index: number, updatedBlock: Block) => {
        if (section.description) {
            const updatedBlocks = [...section.description.blocks];
            updatedBlocks[index] = updatedBlock;
            onUpdate({ ...section, description: { blocks: updatedBlocks } });
        }
    };

    const deleteBlock = (index: number) => {
        if (section.description) {
            const updatedBlocks = section.description.blocks.filter((_, i) =>
                i !== index
            );
            onUpdate({ ...section, description: { blocks: updatedBlocks } });
        }
    };

    const addSubsection = () => {
        const newSubsection: Section = {
            title: "New Subsection",
            description: { blocks: [] },
        };
        const updatedSections = section.sections
            ? [...section.sections, newSubsection]
            : [newSubsection];
        onUpdate({ ...section, sections: updatedSections });
    };

    return (
        <Expandable title={section.title} description={section.description} defaultExpanded={false} searchTerm={searchTerm}>
            <div
                id={`section-${chapterIndex}-${sectionIndex}`}
                class={`ml-${depth * 4} border-l-2 border-blue-500 pl-4 my-4`}
            >
                <div class="flex items-center justify-between">
                    {isEditingTitle
                        ? (
                            <div class="flex-grow">
                                <div class="flex items-center flex-grow">
                                    <HeadingTag class="font-bold mt-2 text-lg bg-purple-200 text-purple-800 p-2 rounded mr-2">
                                        {highlightSearchTerm(section.title, searchTerm)}
                                    </HeadingTag>
                                    <Button
                                        text=""
                                        onClick={() => toggleIsEditingTitle()}
                                        styles="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                                        icon={IconEdit}
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    class="w-full p-2 border-2 border-blue-500 rounded mb-2 focus:(outline-none ring-4 ring-yellow-400)"
                                />
                                <Button
                                    text="Save"
                                    onClick={handleTitleSave}
                                    styles="bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2 mr-2"
                                />
                                <Button
                                    text="Cancel"
                                    onClick={() => {
                                        setIsEditingTitle(false);
                                        setTitle(section.title);
                                    }}
                                    styles="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2"
                                />
                            </div>
                        )
                        : (
                            <div class="flex items-center flex-grow">
                                <HeadingTag class="font-bold mt-2 text-lg p-2 rounded mr-2">
                                    {highlightSearchTerm(section.title, searchTerm)}
                                </HeadingTag>
                                <Button
                                    text=""
                                    onClick={() => toggleIsEditingTitle()}
                                    styles="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                                    icon={IconEdit}
                                />
                            </div>
                        )}
                    <Button
                        text="Delete"
                        onClick={onDelete}
                        styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1"
                    />
                </div>
                {section.description &&
                    section.description.blocks.map((block, index) => (
                        <div key={index}>
                            <RenderBlock
                                block={block}
                                onDelete={() =>
                                    deleteBlock(index)}
                                isActive={activeBlock === block.id}
                                setActiveBlock={setActiveBlock}
                                updateBlock={updateBlock}
                                myIndex={index}
                                searchTerm= {searchTerm}
                            />
                        </div>
                    ))}
                <div class="flex flex-wrap">
                    <AddBlockButton
                        onAdd={() => addBlock("paragraph")}
                        text="Add Paragraph"
                    />
                    <AddBlockButton
                        onAdd={() => addBlock("header")}
                        text="Add Header"
                    />
                    <AddBlockButton
                        onAdd={() => addBlock("unordered-list-item")}
                        text="Add List Item"
                    />
                    <AddBlockButton
                        onAdd={addSubsection}
                        text="Add Subsection"
                    />
                </div>
                {section.sections?.map((subSection, index) => (
                    <ChapterSection
                        chapterIndex={chapterIndex}
                        sectionIndex={sectionIndex}
                        key={index}
                        section={subSection}
                        depth={depth + 1}
                        onUpdate={(updatedSubSection) => {
                            const updatedSections = [
                                ...(section.sections || []),
                            ];
                            updatedSections[index] = updatedSubSection;
                            onUpdate({ ...section, sections: updatedSections });
                        }}
                        onDelete={() => {
                            const updatedSections = (section.sections || [])
                                .filter(
                                    (_, i) => i !== index,
                                );
                            onUpdate({ ...section, sections: updatedSections });
                        }}
                        activeBlock={activeBlock}
                        setActiveBlock={setActiveBlock}
                        searchTerm={searchTerm}
                    />
                ))}
            </div>
        </Expandable>
    );
};

export default ChapterSection;

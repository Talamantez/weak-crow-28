import { useEffect, useState } from "preact/hooks";
import Button from "./Button.tsx";
import IconCheck from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/check.tsx";
import IconChevronUp from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/chevron-up.tsx";
import IconChevronDown from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/chevron-down.tsx";
import IconEdit from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/edit.tsx";
import { Chapter } from "../util/types.ts";
import ChapterSection from "./ChapterSection.tsx";
import ConfirmationModal from "./ConfirmationModal.tsx";
import { Logger } from "../util/logger.ts";
import AddBlockButton from "./AddBlockButton.tsx";
import { highlightSearchTerm } from "./highlightSearchTerm.tsx";

export const ChapterComponent = (
  {
    chapter,
    onUpdate,
    onDelete,
    isExpanded,
    onToggleExpand,
    searchTerm,
    hideCheckbox,
    hideExpandButton,
  }: {
    chapter: Chapter;
    onUpdate: (updatedChapter: Chapter) => void;
    onDelete: () => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    searchTerm: string;
    hideCheckbox: boolean;
    hideExpandButton: boolean;
  },
) => {
  const [activeBlock, setActiveBlock] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(chapter.title);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(chapter.description.blocks[0].text);

  const handleImageUpload = async (e: Event): Promise<void> => {
    const functionId = crypto.randomUUID();
    Logger.info(`[${functionId}] handleImageUpload started`);

    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      Logger.warn(`[${functionId}] No file selected`);
      return;
    }

    const file = input.files[0];
    Logger.info(
      `[${functionId}] File selected: ${file.name}, size: ${file.size} bytes, type: ${file.type}`,
    );

    if (!file.type.startsWith("image/")) {
      Logger.error(
        `[${functionId}] Invalid file type: ${file.type}. Expected an image.`,
      );
      // Consider showing an error message to the user
      return;
    }

    try {
      const base64String = await convertToBase64(file);
      Logger.info(`[${functionId}] Image converted to base64 successfully`);
      onUpdate({ ...chapter, imageUrl: base64String });
    } catch (error) {
      Logger.error(`[${functionId}] Error processing image:`, {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      // Consider showing an error message to the user
    }

    Logger.info(`[${functionId}] handleImageUpload completed`);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleTitleChange = (e: Event) => {
    const newTitle = (e.target as HTMLInputElement).value;
    setTitle(newTitle);
  };

  const handleTitleSave = () => {
    onUpdate({ ...chapter, title });
    setIsEditingTitle(false);
  };

  useEffect(() => {
    if (typeof (chapter.description) === "string") {
      setDescription(chapter.description);
    } else {
      setDescription(chapter.description.blocks[0].text)
    }
  }, [chapter.description]);

  const toggleInclude = () => {
    onUpdate({ ...chapter, isIncluded: !chapter.isIncluded });
  };

  const toggleIsEditingTitle = () => {
    setIsEditingTitle(!isEditingTitle);
  };

  const toggleIsEditingDescription = () => {
    setIsEditingDescription(!isEditingDescription);
  };

  const handleDeleteClick = () => {
    setIsConfirmModalOpen(true);
  };

  const addSection = () => {
    const newSection: Section = {
      title: "New Section",
      description: { blocks: [] },
    };
    const updatedSections = [...chapter.sections, newSection];
    onUpdate({ ...chapter, sections: updatedSections });
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleDescriptionChange = (e: Event) => {
    const newDescription = (e.target as HTMLTextAreaElement).value;
    setDescription(newDescription);
  };

  const handleDescriptionSave = () => {
    onUpdate({ ...chapter, description });
    setIsEditingDescription(false);
  };
  return (
    <div>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          {!hideExpandButton && (
            <Button
              text=""
              onClick={onToggleExpand}
              styles="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 mr-2"
              icon={isExpanded ? IconChevronUp : IconChevronDown}
            />
          )}
          {!hideCheckbox && (
            <button
              onClick={toggleInclude}
              class={`mr-2 w-6 h-6 flex items-center justify-center border-2 rounded ${
                chapter.isIncluded
                  ? "bg-blue-500 border-blue-500"
                  : "border-gray-400"
              }`}
            >
              {chapter.isIncluded && <IconCheck class="w-4 h-4 text-white" />}
            </button>
          )}
          {isEditingTitle
            ? (
              <div>
                <div class="flex items-center">
                  <h2 class="text-xl font-bold bg-purple-200 text-purple-800 p-2 rounded mr-2">
                    {/* {chapter.title} */}
                    {highlightSearchTerm(chapter.title, searchTerm)}
                  </h2>
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
                    setTitle(chapter.title);
                  }}
                  styles="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2"
                />
              </div>
            )
            : (
              <div class="flex items-center">
                <h2 class="text-sm lg:text-lg font-bold p-2 rounded mr-2">
                  {highlightSearchTerm(chapter.title, searchTerm)}
                </h2>
              </div>
            )}
        </div>
        <div class="flex items-center">
          <Button
            text="Delete"
            onClick={handleDeleteClick}
            styles="bg-red-500 hover:bg-red-600 text-white rounded mx-2 px-2 py-1"
          />
        </div>
      </div>
      {isExpanded && (
        <>
          <div class="mb-4">
            {chapter.imageUrl
              ? (
                <div class="relative">
                  <img
                    src={chapter.imageUrl}
                    alt={chapter.title || "Chapter image"}
                    class="w-full h-32 object-cover rounded-t-lg mb-2"
                  />
                  <Button
                    text="Change Image"
                    onClick={() =>
                      document.getElementById(`imageUpload-${chapter.index}`)
                        ?.click()}
                    styles="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1"
                  />
                </div>
              )
              : (
                <Button
                  text="Add Cover Image"
                  onClick={() =>
                    document.getElementById(`imageUpload-${chapter.index}`)
                      ?.click()}
                  styles="w-full bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 mb-2"
                />
              )}
            <input
              id={`imageUpload-${chapter.index}`}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              class="hidden"
            />
          </div>
          <div class="mb-4">
            {isEditingDescription
              ? (
                <div>
                  <div class="flex items-center">
                    <p class="flex-grow bg-purple-200 text-purple-800 p-2 rounded mr-2">
                      {highlightSearchTerm(chapter.description, searchTerm)}
                    </p>
                    <Button
                      text=""
                      onClick={() => toggleIsEditingDescription()}
                      styles="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                      icon={IconEdit}
                    />
                  </div>
                  <input
                    type="text"
                    value={description}
                    onChange={handleDescriptionChange}
                    class="w-full p-2 border-2 border-blue-500 rounded mb-2 focus:(outline-none ring-4 ring-yellow-400)"
                  />
                  <Button
                    text="Save"
                    onClick={handleDescriptionSave}
                    styles="bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2 mr-2"
                  />
                  <Button
                    text="Cancel"
                    onClick={() => {
                      setIsEditingDescription(false);
                      setDescription(chapter.description);
                    }}
                    styles="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2"
                  />
                </div>
              )
              : (
                <div class="flex items-center">
                  <p class="flex-grow p-2 rounded mr-2">
                    {highlightSearchTerm(chapter.description, searchTerm)}
                  </p>
                  <Button
                    text=""
                    onClick={() => setIsEditingDescription(true)}
                    styles="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                    icon={IconEdit}
                  />
                </div>
              )}
          </div>

          {chapter.sections.map((section, index) => (
            <ChapterSection
              key={index}
              section={section}
              onUpdate={(updatedSection) => {
                const updatedSections = [...chapter.sections];
                updatedSections[index] = updatedSection;
                onUpdate({ ...chapter, sections: updatedSections });
              }}
              onDelete={() => {
                const updatedSections = chapter.sections.filter((_, i) =>
                  i !== index
                );
                onUpdate({ ...chapter, sections: updatedSections });
              }}
              activeBlock={activeBlock}
              setActiveBlock={setActiveBlock}
              chapterIndex={chapter.index}
              sectionIndex={index}
              searchTerm={searchTerm}
            />
          ))}
          <div>
            <AddBlockButton onAdd={addSection} text="Add Section" />
          </div>
        </>
      )}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={onDelete}
        message={`Are you sure you want to delete the chapter "${chapter.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

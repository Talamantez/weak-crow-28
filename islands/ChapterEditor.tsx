// import { IconEdit, IconTrash, IconPlus, IconCheck, IconX } from '@tabler/icons-preact';
import IconEdit from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/edit.tsx";
import IconTrash from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/trash.tsx";
import IconPlus from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/plus.tsx";
import IconCheck from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/check.tsx";
import IconX from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/x.tsx";

import { useState } from "preact/hooks";

// Calm color palette
const colors = {
  background: "#f0f4f8",
  text: "#2d3748",
  border: "#cbd5e0",
  accent: "#4299e1",
  success: "#48bb78",
  danger: "#f56565",
  muted: "#a0aec0",
};

const EditableText = (
  { value, onChange, onSave, onCancel }: {
    value: string;
    onChange: (value: string) => void;
    onSave: (value: string) => void;
    onCancel: () => void;
  },
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);

  const handleSave = () => {
    onSave(text);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(value);
    setIsEditing(false);
    onCancel();
  };

  if (isEditing) {
    return (
      <div class="flex items-center">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          class="flex-grow px-2 py-1 mr-2 border rounded"
          style={{ borderColor: colors.border, color: colors.text }}
        />
        <button
          onClick={handleSave}
          class="p-1 mr-1 rounded-full"
          style={{ backgroundColor: colors.success, color: "white" }}
        >
          <IconCheck size={16} />
        </button>
        <button
          onClick={handleCancel}
          class="p-1 rounded-full"
          style={{ backgroundColor: colors.danger, color: "white" }}
        >
          <IconX size={16} />
        </button>
      </div>
    );
  }

  return (
    <div class="flex items-center group">
      <span class="flex-grow">{value}</span>
      <button
        onClick={() => setIsEditing(true)}
        class="p-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ color: colors.accent }}
      >
        <IconEdit size={16} />
      </button>
    </div>
  );
};

const Section = (
  { section, onUpdate, onDelete, depth = 0 }: {
    section: any;
    onUpdate: any;
    onDelete: any;
    depth?: number;
  },
) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddSubsection = () => {
    const newSubsection = {
      title: "New Subsection",
      content: "",
      sections: [],
    };
    onUpdate({ ...section, sections: [...section.sections, newSubsection] });
  };

  return (
    <div
      class="mb-4 pl-4"
      style={{ borderLeft: `2px solid ${colors.border}` }}
    >
      <div class="flex items-center mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          class="mr-2 text-sm"
          style={{ color: colors.muted }}
        >
          {isExpanded ? "▼" : "►"}
        </button>
        <EditableText
          value={section.title}
          onSave={(newTitle) => onUpdate({ ...section, title: newTitle })}
          onCancel={() => {}}
          onChange={(value) => {
            console.log(value);
          }}
        />
        <button
          onClick={onDelete}
          class="p-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ color: colors.danger }}
        >
          <IconTrash size={16} />
        </button>
      </div>
      {isExpanded && (
        <>
          <div class="mb-2 pl-4">
            <EditableText
              value={section.content}
              onSave={(newContent) =>
                onUpdate({ ...section, content: newContent })}
              onCancel={() => {}}
              onChange={(value) => {
                console.log(value);
              }}
            />
          </div>
          {section.sections.map((subsection: any, index: number) => (
            <Section
              key={index}
              section={subsection}
              onUpdate={(updatedSubsection: any) => {
                const newSections = [...section.sections];
                newSections[index] = updatedSubsection;
                onUpdate({ ...section, sections: newSections });
              }}
              onDelete={() => {
                const newSections = section.sections.filter((_, i) =>
                  i !== index
                );
                onUpdate({ ...section, sections: newSections });
              }}
              depth={depth + 1}
            />
          ))}
          <button
            onClick={handleAddSubsection}
            class="flex items-center mt-2 text-sm"
            style={{ color: colors.accent }}
          >
            <IconPlus size={14} class="mr-1" /> Add Subsection
          </button>
        </>
      )}
    </div>
  );
};

const ChapterEditor = (
  { chapter, onUpdate }: { chapter: any; onUpdate: any },
) => {
  return (
    <div
      class="p-6 rounded-lg shadow-lg"
      style={{ backgroundColor: colors.background }}
    >
      <h2
        class="text-2xl font-semibold mb-4"
        style={{ color: colors.text }}
      >
        <EditableText
          value={chapter.title}
          onSave={(newTitle) => onUpdate({ ...chapter, title: newTitle })}
          onCancel={() => {}}
          onChange={(value) => {
            console.log(value);
          }}
        />
      </h2>
      {chapter.sections.map((section: any, index: number) => (
        <Section
          key={index}
          section={section}
          onUpdate={(updatedSection: any) => {
            const newSections = [...chapter.sections];
            newSections[index] = updatedSection;
            onUpdate({ ...chapter, sections: newSections });
          }}
          onDelete={() => {
            const newSections = chapter.sections.filter((_, i) => i !== index);
            onUpdate({ ...chapter, sections: newSections });
          }}
        />
      ))}
      <button
        onClick={() => {
          const newSection = {
            title: "New Section",
            content: "",
            sections: [],
          };
          onUpdate({ ...chapter, sections: [...chapter.sections, newSection] });
        }}
        class="flex items-center mt-4 text-sm"
        style={{ color: colors.accent }}
      >
        <IconPlus size={14} class="mr-1" /> Add Section
      </button>
    </div>
  );
};

export default ChapterEditor;

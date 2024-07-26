import Button from "../components/Button.tsx";
import IconPlus from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/plus.tsx";
import IconCheck from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/check.tsx";
import IconX from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/x.tsx";
import IconArrowsSort from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/arrows-sort.tsx";

export const ChapterControls = ({ isReordering, onAddNew, onSaveOrder, onCancelReorder, onStartReorder, onDeleteAll }) => (
  <div class='flex'>
    <Button
      text="Add New Chapter"
      onClick={onAddNew}
      styles="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 rounded-md py-2 px-4 text-white transition-colors focus:outline-none outline-none"
      icon={IconPlus}
    />
    {isReordering ? (
      <>
        <Button
          text="Save Order"
          onClick={onSaveOrder}
          styles="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-md py-2 px-4 transition-colors focus:outline-none outline-none mb-2 sm:mb-0"
          icon={IconCheck}
        />
        <Button
          text="Cancel"
          onClick={onCancelReorder}
          styles="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-md py-2 px-4 transition-colors focus:outline-none outline-none"
          icon={IconX}
        />
      </>
    ) : (
      <Button
        text="Reorder Chapters"
        onClick={onStartReorder}
        styles="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md py-2 px-4 transition-colors focus:outline-none outline-none mb-2 sm:mb-0"
        icon={IconArrowsSort}
      />
    )}
    <Button
      text="Delete All Chapters"
      onClick={onDeleteAll}
      styles="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-md py-2 px-4 transition-colors focus:outline-none outline-none"
      icon={IconX}
    />
  </div>
);
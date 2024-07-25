import IconPlus from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/plus.tsx";
import Button from "./Button.tsx";

const AddBlockButton = ({ onAdd, text }) => (
    <Button
      text={text}
      onClick={onAdd}
      styles="bg-green-500 hover:bg-green-600 text-white rounded px-2 py-1 mr-2 mt-2"
      icon={IconPlus}
    />
  );

  export default AddBlockButton;
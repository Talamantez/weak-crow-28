import { CollapsibleSection } from "./CollapsibleSection.tsx";
import Button from "../components/Button.tsx";

export const ContentHeader = ({ onGenerate, onPrint, onManageVersions }) => (
    <div class="bg-gray-800 text-white w-full rounded-lg p-8 mb-10">
      <h1 class="text-3xl font-bold mb-4">Resource Roadmap</h1>
      <p class="mb-4">Welcome to Your Local Resource Publication Creator!</p>
      <Button
        text="Generate Example Chapters"
        styles="bg-white text-gray-800 rounded px-4 py-2 mb-2 w-full"
        onClick={onGenerate}
      />
      <Button
        text="Print Your Roadmap"
        styles="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 w-full"
        onClick={onPrint}
      />
      <Button
        text="Manage Versions"
        onClick={onManageVersions}
        styles="bg-purple-500 hover:bg-purple-600 text-white rounded px-4 py-2 my-2"
      />
    </div>
);

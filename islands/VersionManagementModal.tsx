import { useState } from "preact/hooks";
import Button from "../components/Button.tsx";
import { RoadmapVersion } from "./versionManagement.ts";

interface VersionManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    versions: RoadmapVersion[];
}

export function VersionManagementModal(
    { isOpen, onClose, onSave, onLoad, onDelete, versions }:
        VersionManagementModalProps,
) {
    const [newVersionName, setNewVersionName] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Manage Versions</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        value={newVersionName}
                        onChange={(e) =>
                            setNewVersionName(
                                (e.target as HTMLInputElement).value,
                            )}
                        placeholder="New version name"
                        className="w-full p-2 border rounded"
                    />
                    <Button
                        text="Save Current Version"
                        onClick={() => {
                            onSave(newVersionName);
                            setNewVersionName("");
                        }}
                        styles="mt-2 bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 w-full"
                    />
                </div>
                <ul className="mb-4">
                    {versions.map((version) => (
                        <li
                            key={version.id}
                            className="mb-2 p-2 border rounded"
                        >
                            <span>
                                {version.name} -{" "}
                                {new Date(version.date).toLocaleString()}
                            </span>
                            <div className="mt-2">
                                <Button
                                    text="Load"
                                    onClick={() => onLoad(version.id)}
                                    styles="bg-green-500 hover:bg-green-600 text-white rounded px-2 py-1 mr-2"
                                />
                                <Button
                                    text="Delete"
                                    onClick={() => onDelete(version.id)}
                                    styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1"
                                />
                            </div>
                        </li>
                    ))}
                </ul>
                <Button
                    text="Close"
                    onClick={onClose}
                    styles="bg-gray-500 hover:bg-gray-600 text-white rounded px-4 py-2 w-full"
                />
            </div>
        </div>
    );
}

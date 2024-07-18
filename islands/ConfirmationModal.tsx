import Button from "../components/Button.tsx";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Confirm Action</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end">
          <Button
            text="Cancel"
            onClick={onClose}
            styles="bg-gray-300 hover:bg-gray-400 text-black rounded px-4 py-2 mr-2"
          />
          <Button
            text="Confirm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            styles="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2"
          />
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
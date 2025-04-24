interface ConfirmActionProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmAction = ({ isOpen, title, message, onConfirm, onCancel }: ConfirmActionProps) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={event => {
        event.stopPropagation();
      }}
    >
      <div className="relative z-[100] bg-mf-ash-500 rounded-md p-6 max-w-md w-full mx-6">
        <div className="flex w-full flex-col items-center justify-center space-y-6">
          <div className="flex w-full flex-col items-center space-y-4">
            <h2 className="text-mf-edge-500 text-base font-medium">{title}</h2>
            <p className="text-mf-safety-500 text-xs font-light">{message}</p>
          </div>

          <div className="flex w-full items-center space-x-2">
            <button
              onClick={onCancel}
              className="p-2 flex-1 text-xs rounded-md font-medium text-mf-safety-500 bg-mf-ash-500 hover:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="p-2 flex-1 text-xs rounded-md font-medium text-mf-night-500 bg-mf-sybil-500 hover:opacity-50"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAction;

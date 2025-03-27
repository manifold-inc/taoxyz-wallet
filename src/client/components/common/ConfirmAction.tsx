interface ConfirmActionProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmAction = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmActionProps) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <div className="relative z-[100] bg-mf-night-500 border-sm border-2 border-mf-ash-500 p-6 max-w-md w-full mx-6">
        <div className="flex w-full flex-col items-center justify-center space-y-6">
          <div className="flex w-full flex-col items-center space-y-4">
            <h2 className="text-mf-milk-300 text-base">{title}</h2>
            <p className="text-mf-safety-500 text-xs">{message}</p>
          </div>

          <div className="flex w-full items-center space-x-2">
            <button
              onClick={onCancel}
              className="p-2 flex-1 text-xs text-mf-safety-500 border-2 border-sm border-mf-safety-500 bg-mf-night-500 hover:bg-mf-safety-500 hover:text-mf-night-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="p-2 flex-1 text-xs text-mf-night-500 border-2 border-sm border-mf-safety-500 bg-mf-safety-500 hover:bg-mf-night-500 hover:text-mf-safety-500 transition-colors"
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

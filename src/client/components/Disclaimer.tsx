interface DisclaimerProps {
  onClose: () => void;
}

const DisclaimerModal = ({ onClose }: DisclaimerProps) => {
  return (
    <div className=" bg-mf-night-700 flex flex-col items-center min-h-screen py-4">
      <div className="w-full mt-8 px-6 max-w-[300px]">
        <h2 className="text-[18px] font-semibold text-mf-silver-300 mb-8 flex text-center">
          THIS IS A NON-CUSTODIAL WALLET CREATED BY MANIFOLD LABS INC.
        </h2>

        <p className="text-mf-milk-300 text-[12px] mb-6">
          You can use this wallet to securely store and transfer TAO. Please
          securely store all mnemonics and passwords created.
        </p>

        <ul className="text-mf-milk-300 text-[12px] space-y-3 mb-6">
          <li>
            • We refrain from transmitting any clicks, page views or events to a
            central server.
          </li>
          <li>• We abstain from utilizing any trackers or analytics.</li>
          <li>
            • We do not gather addresses, keys or other personal information.
          </li>
        </ul>

        <p className="text-mf-milk-300 text-[12px]">
          For support or questions, please contact hey@manifoldlabs.inc
        </p>
      </div>

      <div className="flex-1 flex items-end justify-center">
        <button
          onClick={onClose}
          className="w-54 text-[12px] flex items-center justify-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors mb-3 px-4 py-3"
        >
          <span className="text-mf-milk-300">Back</span>
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;

import type { StakeTransaction } from "../../../types/client";

interface StakeOverviewProps {
  stake: StakeTransaction;
  onClick: () => void;
}

const StakeOverview = ({ stake, onClick }: StakeOverviewProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-sm p-2 bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors space-y-1"
    >
      <div className="flex items-center justify-between text-sm">
        <h3 className="font-semibold text-mf-silver-300">
          Subnet {stake.subnetId}
        </h3>
        <span className="text-mf-safety-300">α</span>
      </div>
      <div className="flex items-center justify-between text-sm text-mf-milk-300">
        <p>
          {stake.validatorHotkey.slice(0, 6)}...
          {stake.validatorHotkey.slice(-6)}
        </p>
        <p>{(stake.tokens / 1e9).toFixed(4)}</p>
      </div>
    </button>
  );
};

export default StakeOverview;

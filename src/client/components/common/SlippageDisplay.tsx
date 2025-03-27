interface SlippageDisplayProps {
  amount: string;
  slippage: {
    tokens: number;
    slippagePercentage: number;
  };
  isRoot?: boolean;
  moveStake?: boolean;
}

const SlippageDisplay = ({
  amount,
  slippage,
  moveStake = false,
  isRoot = false,
}: SlippageDisplayProps) => {
  const fee = moveStake ? 0.00005 : 0.0001;
  const payToken = isRoot && moveStake ? "τ" : "α";
  const receiveToken = isRoot ? "τ" : "α";

  const formatNumber = (num: number) => {
    return Math.floor(num * 10000) / 10000;
  };

  return (
    <>
      <div className="rounded-sm bg-mf-ash-500 p-4 space-y-4 text-xs mt-2">
        <div className="flex justify-between items-center">
          <span className="text-mf-silver-300">Your Price:</span>
          <span className="text-mf-sybil-500">
            {formatNumber(parseFloat(amount))} {payToken}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-mf-silver-300">You Receive:</span>
          <span className="text-mf-sybil-500">
            {formatNumber(slippage.tokens)} {receiveToken}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-mf-silver-300">Slippage:</span>
          <span
            className={`${
              slippage.slippagePercentage > 5
                ? "text-mf-safety-500"
                : "text-mf-silver-300"
            }`}
          >
            {slippage.slippagePercentage.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-mf-silver-300">Fee:</span>
          <span className="text-mf-safety-500">{fee} τ</span>
        </div>
      </div>
    </>
  );
};

export default SlippageDisplay;

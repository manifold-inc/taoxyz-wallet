interface SlippageDisplayProps {
  amount: string;
  slippage: {
    tokens: number;
    slippagePercentage: number;
  };
  tokenSymbol: string;
}

const SlippageDisplay = ({
  amount,
  slippage,
  tokenSymbol,
}: SlippageDisplayProps) => {
  return (
    <div className="rounded-sm bg-mf-ash-500 p-4 space-y-4 text-xs mt-2">
      <div className="flex justify-between items-center">
        <span className="text-mf-silver-300">Your Price:</span>
        <span className="text-mf-sybil-500">
          {parseFloat(amount).toFixed(4)} {tokenSymbol}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-mf-silver-300">You Receive:</span>
        <span className="text-mf-sybil-500">
          {slippage.tokens.toFixed(4)} {tokenSymbol}
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
        <span className="text-mf-safety-500">0.00005 τ</span>
      </div>
    </div>
  );
};

export default SlippageDisplay;

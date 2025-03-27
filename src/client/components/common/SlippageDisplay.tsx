import type { Slippage } from "../../../types/client";

interface SlippageDisplayProps {
  amount: string;
  balance: string;
  balanceInRao: bigint;
  amountInRao: bigint;
  slippage?: Slippage;
  isRoot?: boolean;
  moveStake?: boolean;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SlippageDisplay = ({
  amount,
  balance,
  amountInRao,
  balanceInRao,
  slippage,
  moveStake = false,
  isRoot = false,
  handleAmountChange,
}: SlippageDisplayProps) => {
  const fee = moveStake ? 0.00005 : 0.0001;
  const payToken = isRoot ? "τ" : "α";
  const receiveToken = isRoot ? "τ" : "α";
  const receiveAmount = isRoot ? parseFloat(amount) : slippage?.tokens || 0;

  const formatNumber = (num: number) => {
    return Math.floor(num * 10000) / 10000;
  };

  return (
    <>
      <div className="text-xs">
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={handleAmountChange}
          placeholder={`Enter Amount (${payToken})`}
          className={`w-full px-3 py-2 border-sm bg-mf-ash-300 text-mf-milk-300 border-2 ${
            !amount
              ? "border-transparent focus:border-mf-safety-500"
              : amountInRao > balanceInRao
              ? "border-mf-safety-500"
              : "border-mf-sybil-500"
          }`}
        />
        <p className="ml-4 mt-2 text-mf-sybil-500">Balance: {balance}τ</p>
      </div>
      {amountInRao > 0 && slippage && (
        <div className="border-2 border-mf-ash-500 rounded-sm bg-mf-ash-500 p-2 space-y-2 text-xs mt-2">
          <div className="flex justify-between items-center">
            <span className="text-mf-silver-300">Your Price:</span>
            <span className="text-mf-sybil-500">
              {formatNumber(parseFloat(amount))} {payToken}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-mf-silver-300">You Receive:</span>
            <span className="text-mf-sybil-500">
              {formatNumber(receiveAmount)} {receiveToken}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-mf-silver-300">Slippage:</span>
            <span
              className={`${
                slippage?.slippagePercentage > 5
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
      )}
    </>
  );
};

export default SlippageDisplay;

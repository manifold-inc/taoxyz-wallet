import { useMemo } from "react";
import type { Stake } from "../../types/stake";

interface PortfolioProps {
  stakes: Stake[];
  className?: string;
}

export const Portfolio = ({ stakes, className = "" }: PortfolioProps) => {
  const formatTao = useMemo(
    () => (rao: number) => {
      return (rao / 1e9).toFixed(4);
    },
    []
  );

  return (
    <div className={`bg-white rounded-lg p-4 shadow ${className}`}>
      <h2 className="text-lg font-semibold mb-4">Stakes</h2>
      {stakes.length > 0 ? (
        <div className="space-y-4">
          {stakes.map((stake, index) => (
            <div key={index} className="border-b pb-4 last:border-0">
              <p>
                <span className="font-medium">Subnet:</span> {stake.netuid}
              </p>
              <p className="break-all">
                <span className="font-medium">Validator:</span> {stake.hotkey}
              </p>
              <p>
                <span className="font-medium">Tokens:</span>{" "}
                {formatTao(stake.stake)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No stakes found</p>
      )}
    </div>
  );
};

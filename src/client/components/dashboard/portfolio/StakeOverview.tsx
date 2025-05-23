import { formatNumber, raoToTao } from '@/utils/utils';

import type { Stake, Subnet } from '../../../../types/client';

interface StakeOverviewProps {
  subnet: Subnet;
  stake: Stake;
  onClick: () => void;
}

const StakeOverview = ({ stake, subnet, onClick }: StakeOverviewProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-md cursor-pointer p-3 bg-mf-ash-500 hover:bg-mf-ash-300 gap-1"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <p className="font-semibold text-mf-edge-500 text-sm truncate max-w-[16ch]">
            {subnet.name}
          </p>
          <span className="font-semibold text-mf-edge-700 text-sm">SN{subnet.id}</span>
        </div>
        <span className="text-mf-edge-500 text-sm">{stake.netuid === 0 ? 'τ' : 'α'}</span>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-mf-sybil-500 text-sm">
          {stake.hotkey.slice(0, 6)}...{stake.hotkey.slice(-6)}
        </p>
        <p className="text-mf-edge-500 text-sm">{formatNumber(raoToTao(stake.stake))}</p>
      </div>
    </button>
  );
};

export default StakeOverview;

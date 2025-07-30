import { useRef, useState } from 'react';

import { newApi } from '@/api/api';
import Header from '@/client/components/common/Header';
import DashboardOverview from '@/client/components/dashboard/DashboardOverview';
import PortfolioOverview from '@/client/components/dashboard/portfolio/PortfolioOverview';
import Transaction from '@/client/components/dashboard/transaction/Transaction';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import { useWallet } from '@/client/contexts/WalletContext';

export const Dashboard = () => {
  const { api } = usePolkadotApi();
  const { dashboardState } = useDashboard();
  const { currentAddress } = useWallet();

  const prevAddressRef = useRef<string | null>(null);
  const [selectedStakeKey, setSelectedStakeKey] = useState<string | null>(null);

  const { data: taoPriceData } = newApi.taoPrice.getPrice();

  const fetchData = async (address: string, forceRefresh = false): Promise<void> => {
    if (!api || !address || (!forceRefresh && address === prevAddressRef.current)) return;
    prevAddressRef.current = address;
    // Data is now fetched via React Query, so we just need to trigger refetch
    // The cache update is handled automatically by React Query
  };

  if (api && currentAddress && currentAddress !== prevAddressRef.current) {
    void fetchData(currentAddress);
  }

  return (
    <div className="flex flex-col items-center w-full h-full pt-4 bg-mf-night-500">
      {/* Wallet Selection */}
      <Header />

      {/* Modular Overview */}
      <div className="border-b border-mf-ash-300 w-full">
        <div className="w-full px-5 py-3">
          <DashboardOverview
            taoPrice={taoPriceData?.currentPrice ?? null}
            selectedStakeKey={selectedStakeKey}
          />
        </div>
      </div>

      {/* Modular Section */}
      <div className="w-full px-5 py-3">
        {dashboardState === DashboardState.OVERVIEW && currentAddress && (
          <PortfolioOverview
            selectedStakeKey={selectedStakeKey}
            onStakeSelect={setSelectedStakeKey}
          />
        )}

        {dashboardState !== DashboardState.OVERVIEW && currentAddress && (
          <Transaction
            address={currentAddress}
            dashboardState={dashboardState}
            onRefresh={() => fetchData(currentAddress, true)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

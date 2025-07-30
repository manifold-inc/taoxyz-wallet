import { useState } from 'react';

import { newApi } from '@/api/api';
import Header from '@/client/components/common/Header';
import DashboardOverview from '@/client/components/dashboard/DashboardOverview';
import PortfolioOverview from '@/client/components/dashboard/portfolio/PortfolioOverview';
import Transaction from '@/client/components/dashboard/transaction/Transaction';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useWallet } from '@/client/contexts/WalletContext';

export const Dashboard = () => {
  const { dashboardState } = useDashboard();
  const { currentAddress } = useWallet();
  const [selectedStakeKey, setSelectedStakeKey] = useState<string | null>(null);

  const { data: balance, isLoading: isLoadingBalance } = newApi.balance.getTotal(currentAddress || '');
  const { data: stakes, isLoading: isLoadingStakes } = newApi.stakes.getAllStakes(currentAddress || '');
  const { data: taoPrice, isLoading: isLoadingTaoPrice } = newApi.taoPrice.getPrice();
  const { data: subnets, isLoading: isLoadingSubnets } = newApi.subnets.getAll();

  const isLoading = isLoadingBalance || isLoadingStakes || isLoadingTaoPrice || isLoadingSubnets;

  return (
    <div className="flex flex-col items-center w-full h-full pt-4 bg-mf-night-500">
      {/* Wallet Selection */}
      <Header />

      {/* Modular Overview */}
      <div className="border-b border-mf-ash-300 w-full">
        <div className="w-full px-5 py-3">
          <DashboardOverview
            taoPrice={taoPrice?.currentPrice ?? null}
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
            onRefresh={() => {}}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

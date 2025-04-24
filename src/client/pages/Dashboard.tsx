import { useRef, useState } from 'react';

import WalletSelection from '@/client/components/common/WalletSelection';
import DashboardOverview from '@/client/components/dashboard/DashboardOverview';
import PortfolioOverview from '@/client/components/dashboard/portfolio/PortfolioOverview';
import Transaction from '@/client/components/dashboard/transaction/Transaction';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import { useWallet } from '@/client/contexts/WalletContext';
import type { Stake, Subnet } from '@/types/client';
import { NotificationType } from '@/types/client';
import { raoToTao } from '@/utils/utils';

const API_URL = 'https://tao.xyz/api/price';

interface TaoPriceResponse {
  currentPrice: number;
  price24hAgo: number;
  priceChange24h: number;
}

export const Dashboard = () => {
  const { showNotification } = useNotification();
  const { api } = usePolkadotApi();
  const { dashboardState, setDashboardFreeBalance, setDashboardSubnets, setDashboardStakes } =
    useDashboard();
  const { currentAddress } = useWallet();

  const [stakes, setStakes] = useState<Stake[]>([]);
  const [subnets, setSubnets] = useState<Subnet[]>([]);
  const [freeTao, setFreeTao] = useState<number | null>(null);

  const [taoPrice, setTaoPrice] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const prevAddressRef = useRef<string | null>(null);

  const fetchData = async (address: string, forceRefresh = false): Promise<void> => {
    if (!api || !address || (!forceRefresh && address === prevAddressRef.current)) return;
    setIsLoading(true);
    prevAddressRef.current = address;
    try {
      const [subnets, freeTao, stakes] = await Promise.all([
        api.getSubnets(),
        api.getBalance(address),
        api.getStake(address),
      ]);

      if (subnets === null) {
        showNotification({
          type: NotificationType.Error,
          message: 'Failed to Fetch Subnets',
        });
        return;
      }

      if (freeTao === null) {
        showNotification({
          type: NotificationType.Error,
          message: 'Failed to Fetch Free TAO',
        });
        return;
      }

      if (stakes === null) {
        showNotification({
          type: NotificationType.Error,
          message: 'Failed to Fetch Stakes',
        });
        return;
      }

      setSubnets(subnets);
      setDashboardSubnets(subnets);
      setFreeTao(raoToTao(freeTao));
      setDashboardFreeBalance(freeTao);
      setStakes(stakes);
      setDashboardStakes(stakes);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTaoPrice = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}`);
      const data = (await response.json()) as TaoPriceResponse;
      setTaoPrice(data.currentPrice);
      setPriceChange24h(data.priceChange24h);
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: 'Failed to Fetch TAO Price',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (api && currentAddress && currentAddress !== prevAddressRef.current) {
    void fetchData(currentAddress);
    void fetchTaoPrice();
  }

  return (
    <div className="flex flex-col items-center w-full h-full pt-4 bg-mf-night-500">
      {/* Wallet Selection */}
      <WalletSelection />

      {/* Modular Overview */}
      <div className="border-b border-mf-ash-300 w-full">
        <div className="w-full px-5 py-3">
          <DashboardOverview
            stakes={stakes}
            subnets={subnets}
            freeTao={freeTao}
            taoPrice={taoPrice}
            priceChange24h={priceChange24h}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Modular Section */}
      <div className="w-full px-5 py-3">
        {dashboardState === DashboardState.OVERVIEW && currentAddress && (
          <PortfolioOverview
            stakes={stakes}
            subnets={subnets}
            isLoading={isLoading}
            onRefresh={() => fetchData(currentAddress, true)}
          />
        )}

        {dashboardState !== DashboardState.OVERVIEW && currentAddress && (
          <Transaction
            address={currentAddress}
            dashboardState={dashboardState}
            isLoading={isLoading}
            onRefresh={() => fetchData(currentAddress, true)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

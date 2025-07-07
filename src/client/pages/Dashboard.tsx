import { useEffect, useRef, useState } from 'react';

import { newApi } from '@/api/api';
import Header from '@/client/components/common/Header';
import DashboardOverview from '@/client/components/dashboard/DashboardOverview';
import PortfolioOverview from '@/client/components/dashboard/portfolio/PortfolioOverview';
import Transaction from '@/client/components/dashboard/transaction/Transaction';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import { useWallet } from '@/client/contexts/WalletContext';
import { NotificationType } from '@/types/client';

const API_URL = 'https://tao.xyz/api/price';

export interface TaoPriceResponse {
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

  const [taoPrice, setTaoPrice] = useState<number | null>(null);
  const prevAddressRef = useRef<string | null>(null);

  const [selectedStakeKey, setSelectedStakeKey] = useState<string | null>(null);

  // Example Implementation
  const { data: freeTao, status } = newApi.balance.getFree(currentAddress || '');
  useEffect(() => {
    if (status === 'success') {
      setDashboardFreeBalance(freeTao);
    }
  }, [status, freeTao]);

  const fetchData = async (address: string, forceRefresh = false): Promise<void> => {
    if (!api || !address || (!forceRefresh && address === prevAddressRef.current)) return;
    prevAddressRef.current = address;
    const [subnets, _stakes] = await Promise.all([api.getSubnets(), api.getStake(address)]);

    if (subnets === null) {
      showNotification({
        type: NotificationType.Error,
        message: 'Failed to Fetch Subnets',
      });
      return;
    }

    if (_stakes === null) {
      showNotification({
        type: NotificationType.Error,
        message: 'Failed to Fetch Stakes',
      });
      return;
    }

    setDashboardSubnets(subnets);
    setDashboardStakes(_stakes);
    await chrome.storage.local.set({
      wallet_cache: {
        subnets,
        freeTao,
        _stakes,
      },
    });
  };

  const fetchTaoPrice = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}`);
      const data = (await response.json()) as TaoPriceResponse;
      setTaoPrice(data.currentPrice);
      await chrome.storage.local.set({
        tao_price_cache: {
          taoPrice: data.currentPrice,
          priceChange24h: data.priceChange24h,
        },
      });
    } catch {
      showNotification({
        type: NotificationType.Error,
        message: 'Failed to Fetch TAO Price',
      });
    }
  };

  useEffect(() => {
    chrome.storage.local.get(['tao_price_cache', 'wallet_cache'], r => {
      if (r.tao_price_cache) {
        setTaoPrice(r.tao_price_cache.taoPrice);
      }
      if (r.wallet_cache) {
        setDashboardSubnets(r.wallet_cache.subnets);
        setDashboardFreeBalance(r.wallet_cache.freeTao);
        setDashboardStakes(r.wallet_cache._stakes);
      }
    });
  }, []);

  if (api && currentAddress && currentAddress !== prevAddressRef.current) {
    void fetchData(currentAddress);
    void fetchTaoPrice();
  }

  return (
    <div className="flex flex-col items-center w-full h-full pt-4 bg-mf-night-500">
      {/* Wallet Selection */}
      <Header />

      {/* Modular Overview */}
      <div className="border-b border-mf-ash-300 w-full">
        <div className="w-full px-5 py-3">
          <DashboardOverview taoPrice={taoPrice} selectedStakeKey={selectedStakeKey} />
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

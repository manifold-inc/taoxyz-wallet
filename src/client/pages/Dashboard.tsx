import { motion } from 'framer-motion';

import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Stake, Subnet } from '../../types/client';
import { NotificationType } from '../../types/client';
import WalletSelection from '../components/common/WalletSelection';
import DashboardOverview from '../components/dashboard/DashboardOverview';
// import Portfolio from '../components/dashboard/Portfolio';
import { useNotification } from '../contexts/NotificationContext';
import { usePolkadotApi } from '../contexts/PolkadotApiContext';
import { useWallet } from '../contexts/WalletContext';

const API_URL = 'https://api.coingecko.com/api/v3';
const NETWORK_ID = 'bittensor';

// [Timestamp, Price]
interface PriceData {
  prices: [number, number][];
}

const calculatePriceChange = (
  prices: [number, number][]
): { price: number; priceChange: number } => {
  const [price, oldPrice] = [prices[0][1], prices[prices.length - 1][1]];
  const priceChange = ((price - oldPrice) / oldPrice) * 100;

  return {
    price,
    priceChange,
  };
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { api } = usePolkadotApi();
  const { currentAddress } = useWallet();

  const [stakes, setStakes] = useState<Stake[]>([]);
  const [subnets, setSubnets] = useState<Subnet[]>([]);
  const [freeTao, setFreeTao] = useState<number | null>(null);

  const [taoPrice, setTaoPrice] = useState<number | null>(null);
  const [priceChangePercentage, setPriceChangePercentage] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      setFreeTao(freeTao);
      setStakes(stakes);
      console.log('Dashboard Data', { subnets, freeTao, stakes });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTaoPrice = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/coins/${NETWORK_ID}/market_chart?vs_currency=usd&days=1`
      );
      const data = (await response.json()) as PriceData;
      const { price, priceChange } = calculatePriceChange(data.prices);
      setTaoPrice(price);
      setPriceChangePercentage(priceChange);
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
    <div className="flex flex-col items-center w-full h-full pt-6 bg-mf-night-500">
      {/* Wallet Selection */}
      <WalletSelection />

      <div className="border-b border-mf-ash-300 w-full">
        <div className="flex flex-col w-full gap-3 px-5 py-3">
          {/* Overview */}
          <DashboardOverview
            stakes={stakes}
            subnets={subnets}
            freeTao={freeTao ?? 0}
            taoPrice={taoPrice}
            priceChangePercentage={priceChangePercentage}
            isLoading={isLoading}
          />
          {/* Action Buttons */}
          <div className="flex justify-between gap-3 w-full">
            <motion.button
              onClick={() => navigate('/add-stake')}
              className="w-1/3 py-1.5 bg-mf-sybil-opacity rounded-sm cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm text-mf-sybil-500">Stake</span>
            </motion.button>
            <motion.button
              onClick={() => navigate('/move-stake')}
              className="w-1/3 py-1.5 bg-mf-red-opacity rounded-sm cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm text-mf-red-500">Unstake</span>
            </motion.button>
            <motion.button
              onClick={() => navigate('/transfer')}
              className="w-1/3 py-1.5 bg-mf-safety-opacity rounded-sm cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm text-mf-safety-500">Transfer</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Portfolio Overview */}
      {/* <div className="mt-3">
        <h2 className="text-xs text-mf-sybil-500 font-semibold">Portfolio</h2>
        {isLoading ? (
          <div className="border-sm border-2 border-mf-ash-500 p-2 bg-mf-ash-500 text-sm text-mf-milk-300">
            <p>Loading...</p>
          </div>
        ) : (
          <Portfolio
            stakes={stakes}
            address={currentAddress as string}
            onRefresh={() => (currentAddress ? fetchData(currentAddress, true) : Promise.resolve())}
          />
        )}
      </div> */}
    </div>
  );
};

export default Dashboard;

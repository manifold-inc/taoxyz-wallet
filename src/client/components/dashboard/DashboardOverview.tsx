// /**
//  * Total tao
//  * Free tao
//  * Equivalent in USD
//  * Price of tao
//  * percentage change of tao from 24hr ago
//  * Pie chart showing stake distribution
//  *
//  */
// import { useRef, useState } from 'react';

// import { useNotification } from '@/client/contexts/NotificationContext';
// import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
// import { useWallet } from '@/client/contexts/WalletContext';
// import { NotificationType, type Subnet } from '@/types/client';
// import { formatNumber, raoToTao } from '@/utils/utils';

// interface StakeResponse {
//   netuid: number;
//   hotkey: string;
//   stake: number;
// }

// const DashboardOverview = ({ stakes }: { stakes: any }) => {
//   const { api } = usePolkadotApi();
//   const { showNotification } = useNotification();
//   const { currentAddress } = useWallet();
//   const [totalTao, setTotalTao] = useState<number>(0);
//   const [freeTao, setFreeTao] = useState<number>(0);
//   const [totalTaoUSD, setTotalTaoUSD] = useState<number>(0);
//   const [freeTaoUSD, setFreeTaoUSD] = useState<number>(0);

//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const prevFetchRef = useRef<string | null>(null);

//   const fetchData = async (address: string, forceRefresh = false): Promise<void> => {
//     if (!api || !address || (!forceRefresh && address === prevFetchRef.current)) return;
//     setIsLoading(true);
//     prevFetchRef.current = address;

//     try {
//       const [subnetsResult, freeBalanceResult, stakeResult] = await Promise.all([
//         api.getSubnets(),
//         api.getBalance(address),
//         api.getStake(address),
//       ]);

//       if (subnetsResult === null) {
//         showNotification({
//           type: NotificationType.Error,
//           message: 'Failed to Fetch Subnets',
//         });
//         return;
//       }

//       if (freeBalanceResult === null) {
//         showNotification({
//           type: NotificationType.Error,
//           message: 'Failed to Fetch Balance',
//         });
//         return;
//       }

//       if (stakeResult === null) {
//         showNotification({
//           type: NotificationType.Error,
//           message: 'Failed to Fetch Stakes',
//         });
//         return;
//       }

//       const formattedStakes = await Promise.all(
//         (stakeResult as unknown as StakeResponse[]).map(async stake => {
//           const subnet = await api.getSubnet(stake.netuid);
//           return {
//             subnetId: stake.netuid,
//             subnetName: subnet?.name ?? `Subnet ${stake.netuid}`,
//             validatorHotkey: stake.hotkey,
//             tokens: stake.stake,
//           };
//         })
//       );

//       let totalBalance = freeBalanceResult;
//       for (const stake of formattedStakes) {
//         const subnet = subnetsResult.find(subnet => subnet.id === stake.subnetId) as Subnet;
//         if (subnet) {
//           totalBalance += raoToTao(BigInt(stake.tokens)) * subnet.price;
//         }
//       }

//       setTotalBalance(totalBalance);
//       setBalance(balanceResult);
//       setStakes(formattedStakes);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchUSDToTao = async (): Promise<void> => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(
//         'https://api.coingecko.com/api/v3/coins/bittensor/market_chart?vs_currency=usd&days=1',
//         {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       const data = await response.json();
//       const prices = data.prices;
//       const recentPrice = prices[0][1];
//       const dayOldPrice = prices[prices.length - 1][1];
//       setUsdToTao(recentPrice);
//       setDayOldUsdToTao(dayOldPrice);
//     } catch {
//       showNotification({
//         type: NotificationType.Error,
//         message: 'Failed to Fetch USD to TAO Price',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCopy = async (): Promise<void> => {
//     if (!currentAddress) return;
//     await navigator.clipboard.writeText(currentAddress);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//     showNotification({
//       type: NotificationType.Success,
//       message: 'Address Copied',
//     });
//   };

//   if (api && currentAddress && currentAddress !== prevFetchRef.current) {
//     void fetchData(currentAddress);
//     void fetchUSDToTao();
//   }

//   return (
//     <div className="w-full h-full rounded-sm bg-mf-sybil-opacity p-2">
//       {/* Total and Free TAO */}
//       <div className="flex flex-col items-center justify-center gap-2">
//         <div>
//           <span>{formatNumber(totalTao)}</span>
//         </div>
//         <div>
//           <span>{formatNumber(freeTao)}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardOverview;

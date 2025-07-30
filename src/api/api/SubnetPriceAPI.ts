import { useQuery } from '@tanstack/react-query';

import { useNotification } from '@/client/contexts/NotificationContext';
import { NotificationType } from '@/types/client';
import { raoToTao } from '@/utils/utils';

const API_URL = 'https://tao.xyz/api/subnets/price';

export interface PriceResponse {
  netuid: number;
  price: string;
}

export interface SubnetPriceApiResponse {
  data: PriceResponse[];
}

export const createSubnetPriceAPI = () => ({
  getPriceHistory: (netuid: number) => {
    const { showNotification } = useNotification();

    return useQuery({
      queryKey: ['subnetPriceHistory', netuid],
      queryFn: async (): Promise<PriceResponse[]> => {
        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              allSubnets: false,
              netuid: netuid,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch subnet price history');
          }

          const data: SubnetPriceApiResponse = await response.json();

          const convertedData = data.data.slice(-50).map(price => ({
            netuid: price.netuid,
            price:
              Number(price.price) < 1
                ? price.price
                : raoToTao(BigInt(Number(price.price))).toString(),
          }));

          void chrome.storage.local.set({
            [`price_data_cache_sn${netuid}`]: convertedData,
          });

          return convertedData;
        } catch (error) {
          showNotification({
            type: NotificationType.Error,
            message: 'Failed to Fetch Subnet Price History',
          });
          throw error;
        }
      },
      enabled: netuid !== undefined && netuid !== null,
      staleTime: 300000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    });
  },
});

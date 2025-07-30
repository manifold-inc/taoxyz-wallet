import { useQuery } from '@tanstack/react-query';

import { useNotification } from '@/client/contexts/NotificationContext';
import { NotificationType } from '@/types/client';

const API_URL = 'https://tao.xyz/api/price';

export interface TaoPriceResponse {
  currentPrice: number;
  price24hAgo: number;
  priceChange24h: number;
}

export const createTaoPriceAPI = () => ({
  getPrice: () => {
    const { showNotification } = useNotification();

    return useQuery({
      queryKey: ['taoPrice'],
      queryFn: async (): Promise<TaoPriceResponse> => {
        try {
          const response = await fetch(API_URL);
          if (!response.ok) {
            throw new Error('Failed to fetch TAO price');
          }
          const data = (await response.json()) as TaoPriceResponse;

          // Cache the data in chrome storage
          await chrome.storage.local.set({
            tao_price_cache: {
              taoPrice: data.currentPrice,
              priceChange24h: data.priceChange24h,
            },
          });

          return data;
        } catch (error) {
          showNotification({
            type: NotificationType.Error,
            message: 'Failed to Fetch TAO Price',
          });
          throw error;
        }
      },
      refetchInterval: 1000,
    });
  },
});

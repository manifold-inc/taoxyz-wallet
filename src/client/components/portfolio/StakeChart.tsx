import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useState } from 'react';

interface StakeChartProps {
  data: PriceResponse[];
  isLoading: boolean;
}

interface PriceResponse {
  netuid: number;
  price: string;
}

interface ChartDataPoint {
  netuid: number;
  price: string;
  timestamp: string;
  displayDate: string;
}

const SkeletonChart = () => {
  const skeletonData = Array.from({ length: 10 }, (_, i) => ({
    // Create a wave pattern
    price: Math.sin(i * 0.6) * 0.3 + 0.5,
    displayDate: `${i + 1}`,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={skeletonData} margin={{ top: 10, right: 0, left: -17, bottom: 0 }}>
        <XAxis
          dataKey="displayDate"
          tick={{ fill: '#374151', fontSize: 10 }}
          axisLine={{ stroke: '#374151' }}
          tickLine={{ stroke: '#374151' }}
          tickSize={2}
          tickMargin={5}
          dy={5}
        />
        <YAxis
          domain={[0, 1]}
          tick={{ fill: '#374151', fontSize: 10 }}
          axisLine={{ stroke: '#374151' }}
          tickLine={{ stroke: '#374151' }}
          width={60}
          tickSize={2}
          tickMargin={2}
          tickCount={5}
          dx={-5}
        />
        <Area
          type="monotoneX"
          dataKey="price"
          stroke="#4B5563"
          strokeWidth={2}
          fillOpacity={0.2}
          fill="#4B5563"
          animationDuration={0}
          className="animate-pulse"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const StakeChart = ({ data, isLoading = true }: StakeChartProps) => {
  const [priceData, setPriceData] = useState<ChartDataPoint[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const addTimestamps = (data: PriceResponse[]): ChartDataPoint[] => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const timeInterval = (now.getTime() - sevenDaysAgo.getTime()) / data.length;

    // Filter every other data point to render smoother
    return [...data]
      .reverse()
      .filter((_, index) => index % 2 === 0)
      .map((point, index) => {
        const pointTime = new Date(sevenDaysAgo.getTime() + timeInterval * index * 2);
        return {
          ...point,
          timestamp: pointTime.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          displayDate: pointTime.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
          }),
        };
      });
  };

  const calculateYAxisDomain = (data: ChartDataPoint[]) => {
    if (data.length === 0) return [0, 1];

    const prices = data.map(point => parseFloat(point.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const range = maxPrice - minPrice;
    const padding = Math.max(range * 0.1, 0.0001);

    return [Math.max(0, minPrice - padding), maxPrice + padding];
  };

  const init = async () => {
    const dataWithTimestamps = addTimestamps(data);
    setPriceData(dataWithTimestamps);
    setIsInitialized(true);
  };

  if (!isInitialized && data.length > 0) {
    void init();
  }

  if (isLoading) {
    return <SkeletonChart />;
  }

  if (!priceData.length) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={priceData} margin={{ top: 10, right: 0, left: -17, bottom: 0 }}>
        <XAxis
          dataKey="displayDate"
          tick={{ fill: '#9CA3AF', fontSize: 10 }}
          axisLine={{ stroke: '#374151' }}
          tickLine={{ stroke: '#374151' }}
          tickSize={2}
          tickMargin={5}
          ticks={
            priceData.length > 0
              ? Array.from({ length: 8 }, (_, i) => {
                  const index = Math.floor((priceData.length - 1) * (i / 7));
                  return priceData[index].displayDate;
                })
              : []
          }
          dy={5}
        />
        <YAxis
          domain={calculateYAxisDomain(priceData)}
          tick={{ fill: '#9CA3AF', fontSize: 10 }}
          axisLine={{ stroke: '#374151' }}
          tickLine={{ stroke: '#374151' }}
          tickFormatter={value => `${parseFloat(value).toFixed(4)}τ`}
          width={60}
          tickSize={2}
          tickMargin={2}
          tickCount={5}
          dx={-5}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#22242E',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            padding: '6px',
          }}
          itemStyle={{ color: '#E5F0FF' }}
          labelStyle={{
            color: '#D8E5FF',
            marginBottom: '1px',
          }}
          labelFormatter={(_, payload) => {
            if (!payload || payload.length === 0) return '';
            return payload[0].payload.timestamp;
          }}
          formatter={(value: string) => [`${parseFloat(value).toFixed(4)}τ`, 'Price']}
        />
        <Area
          type="monotoneX"
          dataKey="price"
          stroke="#4FFFB0"
          strokeWidth={2}
          fillOpacity={0.08}
          fill="#4FFFB0"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default StakeChart;

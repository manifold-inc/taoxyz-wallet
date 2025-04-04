import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StakeChartProps {
  data: PriceResponse[];
  subnetId: number;
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

const StakeChart = ({ data, subnetId }: StakeChartProps) => {
  const [priceData, setPriceData] = useState<ChartDataPoint[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const addTimestamps = (data: PriceResponse[]): ChartDataPoint[] => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const timeInterval = (now.getTime() - sevenDaysAgo.getTime()) / data.length;

    return [...data].reverse().map((point, index) => {
      const pointTime = new Date(sevenDaysAgo.getTime() + timeInterval * index);
      return {
        ...point,
        timestamp: pointTime.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        displayDate: pointTime.toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
        }),
      };
    });
  };

  const calculateYAxisDomain = (data: ChartDataPoint[]) => {
    if (data.length === 0) return [0, 1];

    const prices = data.map((point) => parseFloat(point.price));
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

  if (!isInitialized) {
    void init();
    setIsInitialized(true);
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={priceData}
        margin={{ top: 10, right: 0, left: -5, bottom: 0 }}
      >
        <defs>
          <linearGradient
            id={`colorValue${subnetId}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="displayDate"
          tick={{ fill: "#9CA3AF", fontSize: 10 }}
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
          tick={{ fill: "#9CA3AF", fontSize: 10 }}
          tickFormatter={(value) => `${parseFloat(value).toFixed(4)}τ`}
          width={60}
          tickSize={2}
          tickMargin={2}
          tickCount={5}
          dx={-5}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#22242E",
            border: "none",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            padding: "12px",
          }}
          itemStyle={{ color: "#E5F0FF" }}
          labelStyle={{
            color: "#D8E5FF",
            marginBottom: "6px",
          }}
          labelFormatter={(_, payload) => {
            if (!payload || payload.length === 0) return "";
            return payload[0].payload.timestamp;
          }}
          formatter={(value: string) => [
            `${parseFloat(value).toFixed(4)}τ`,
            "Price",
          ]}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#FF6B00"
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#colorValue${subnetId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default StakeChart;

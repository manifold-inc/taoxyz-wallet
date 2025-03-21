import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StakeChartProps {
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
}

interface ApiResponse {
  data: PriceResponse[];
}

const StakeChart = ({ subnetId }: StakeChartProps) => {
  const [priceData, setPriceData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    fetchSubnetPrice();
  }, [subnetId]);

  const addTimestamps = (data: PriceResponse[]): ChartDataPoint[] => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Calculate time interval between points
    const timeInterval = (now.getTime() - sevenDaysAgo.getTime()) / data.length;

    // Reverse the mapping so newest data is at the end
    return [...data].reverse().map((point, index) => {
      const pointTime = new Date(sevenDaysAgo.getTime() + timeInterval * index);
      return {
        ...point,
        timestamp: pointTime.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });
  };

  const fetchSubnetPrice = async () => {
    try {
      const response = await fetch(
        "https://taoxyz.vercel.app/api/subnets/price",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            allSubnets: false,
            netuid: subnetId,
          }),
        }
      );

      const { data } = (await response.json()) as ApiResponse;
      const dataWithTimestamps = addTimestamps(data);
      setPriceData(dataWithTimestamps);
    } catch (error) {
      console.error("Error fetching subnet price:", error);
    }
  };

  const calculateYAxisDomain = (data: ChartDataPoint[]) => {
    if (data.length === 0) return [0, 1]; // Default range if no data

    // Calculate average price
    const prices = data.map((point) => parseFloat(point.price));
    const avgPrice =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;

    // Set range to ±20% of average
    const minPrice = avgPrice * 0.8; // 20% below average
    const maxPrice = avgPrice * 1.2; // 20% above average

    return [minPrice, maxPrice];
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={priceData}
        margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
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
          dataKey="timestamp"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#9CA3AF", fontSize: 10 }}
          tickSize={2}
          tickMargin={2}
          interval="preserveStartEnd"
          minTickGap={50}
          dy={5}
        />
        <YAxis
          domain={calculateYAxisDomain(priceData)}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#9CA3AF", fontSize: 10 }}
          tickFormatter={(value) => `α${parseFloat(value).toFixed(4)}`}
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
          formatter={(value: string) => [
            `α${parseFloat(value).toFixed(4)}`,
            "Stake",
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

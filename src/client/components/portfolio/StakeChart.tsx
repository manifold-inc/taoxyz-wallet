import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const tempStakeData = [
  { timestamp: "00:00", value: 200 },
  { timestamp: "04:00", value: 250 },
  { timestamp: "08:00", value: 220 },
  { timestamp: "12:00", value: 300 },
  { timestamp: "16:00", value: 280 },
  { timestamp: "20:00", value: 350 },
  { timestamp: "24:00", value: 320 },
];

interface StakeChartProps {
  subnetId: number;
}

const StakeChart = ({ subnetId }: StakeChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={tempStakeData}
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
          tickCount={6}
          dy={5}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#9CA3AF", fontSize: 10 }}
          tickFormatter={(value) => `α${value}`}
          width={45}
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
          formatter={(value: number) => [`α${value}`, "Stake"]}
        />
        <Area
          type="monotone"
          dataKey="value"
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

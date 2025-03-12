import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const tempData = [
  { timestamp: "00:00", value: 400 },
  { timestamp: "04:00", value: 300 },
  { timestamp: "08:00", value: 600 },
  { timestamp: "12:00", value: 800 },
  { timestamp: "16:00", value: 700 },
  { timestamp: "20:00", value: 900 },
  { timestamp: "24:00", value: 750 },
];

const BalanceChart = () => {
  return (
    <div className="h-32 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={tempData}
          margin={{ top: 10, right: 5, left: -5, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 8 }}
            tickSize={2}
            tickMargin={0}
            tickCount={4}
            dy={5}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 8 }}
            tickFormatter={(value) => `τ${value}`}
            width={35}
            tickSize={2}
            tickMargin={0}
            tickCount={4}
            dx={-5}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
              padding: "8px",
            }}
            itemStyle={{ color: "#E5E7EB" }}
            labelStyle={{ color: "#9CA3AF", marginBottom: "4px" }}
            formatter={(value: number) => [`τ${value}`, "Balance"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#FF6B00"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BalanceChart;

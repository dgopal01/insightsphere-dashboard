import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface LineChartProps {
  data: Array<{ [key: string]: string | number }>;
  dataKeys: Array<{ key: string; name: string; color?: string }>;
  xAxisKey: string;
}

export function TrendLineChart({ data, dataKeys, xAxisKey }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey={xAxisKey} 
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        />
        <Legend />
        {dataKeys.map((item, index) => (
          <Line
            key={item.key}
            type="monotone"
            dataKey={item.key}
            name={item.name}
            stroke={item.color || (index === 0 ? "#00818F" : "#28334A")}
            strokeWidth={2}
            dot={{ fill: item.color || (index === 0 ? "#00818F" : "#28334A"), r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

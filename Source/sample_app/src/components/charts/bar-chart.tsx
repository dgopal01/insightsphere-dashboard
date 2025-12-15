import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface BarChartProps {
  data: Array<{ [key: string]: string | number }>;
  dataKeys: Array<{ key: string; name: string; color?: string }>;
  xAxisKey: string;
  yAxisMax?: number;
  yAxisLabel?: string;
}

const customLegend = (props: any) => {
  const { payload } = props;
  return (
    <div style={{ 
      textAlign: 'center', 
      marginTop: '20px',
      fontSize: '16px',
      color: '#3C3C40'
    }}>
      {payload[0]?.value}
    </div>
  );
};

export function CarrierBarChart({ data, dataKeys, xAxisKey, yAxisMax, yAxisLabel }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey={xAxisKey} 
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
          domain={yAxisMax ? [0, yAxisMax] : undefined}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '16px', fill: '#3C3C40' } } : undefined}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        />
        <Legend content={customLegend} />
        {dataKeys.map((item, index) => (
          <Bar
            key={item.key}
            dataKey={item.key}
            name={item.name}
            fill={item.color || (index === 0 ? "#00818F" : "#28334A")}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
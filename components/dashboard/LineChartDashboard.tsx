"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartProps {
  data: any[]; // desp de supabase
  isMini?: boolean; // para diferenciar entre vista de detalle (mini) y vista general (completa)
}

// hardcodeado por ahora, luego se reemplaza con datos reales de supabase
const data = [
  { name: "Lun", uv: 400, pv: 240, amt: 2400 },
  { name: "Mar", uv: 300, pv: 139, amt: 2210 },
  { name: "Mie", uv: 200, pv: 980, amt: 2290 },
  { name: "Jue", uv: 278, pv: 390, amt: 2000 },
  { name: "Vie", uv: 189, pv: 480, amt: 2181 },
  { name: "Sab", uv: 239, pv: 380, amt: 2500 },
  { name: "Dom", uv: 349, pv: 430, amt: 2100 },
];

const LineChartDashboard = ({ data, isMini }: ChartProps) => {
  return (
    <div className="w-full h-full min-h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#262626"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            hide={isMini} // Podemos ocultar ejes en la vista de detalle para que sea más limpio
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />
          <YAxis hide={true} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#181818",
              border: "1/10 border-white",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="pv"
            stroke="#ec4899"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="uv"
            stroke="#eab308"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="amt"
            stroke="#4ade80"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartDashboard;

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#3A29FF", "#00C49F", "#FFBB28", "#FF3232"];

export default function DeviceStats({ stats }) {
  const deviceCount = (Array.isArray(stats) ? stats : []).reduce((acc, item) => {
    if (!acc[item.device]) acc[item.device] = 0;
    acc[item.device]++;
    return acc;
  }, {});

  const result = Object.keys(deviceCount).map((device) => ({
    device,
    count: deviceCount[device],
  }));

  return (
    <div className="w-full flex flex-col items-center justify-center py-4">
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={result}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              dataKey="count"
              paddingAngle={2}
              stroke="none"              
            >
              {result.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-4">
        {result.map((entry, idx) => (
          <div key={entry.device} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: COLORS[idx % COLORS.length] }}
            />
            <span className="text-white uppercase">{entry.device}</span><span className="opacity-60 text-white">({entry.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface RingChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export function RingChart({
  percentage,
  size = 64,
  strokeWidth = 6,
  showLabel = true,
  className = "",
}: RingChartProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const data = [
    { value: clampedPercentage },
    { value: 100 - clampedPercentage },
  ];

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size / 2 - strokeWidth}
            outerRadius={size / 2}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill="hsl(var(--primary))" />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {showLabel && (
        <span className="absolute font-mono text-sm font-medium text-foreground font-tabular">
          {Math.round(clampedPercentage)}%
        </span>
      )}
    </div>
  );
}

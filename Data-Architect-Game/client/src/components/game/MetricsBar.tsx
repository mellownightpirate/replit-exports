/**
 * MetricsBar - Top bar showing global game metrics
 */

import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Coins, 
  Scale, 
  Server, 
  Crown,
  Headphones,
} from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';
import { WIN_CONDITIONS, LOSE_THRESHOLDS } from '@/lib/gameTypes';
import { GAME_TITLE } from '@/lib/gameStrings';
import { MascotAuto } from './Mascot';

interface MetricCardProps {
  label: string;
  value: number;
  unit?: string;
  icon: React.ReactNode;
  target?: number;
  lowerIsBetter?: boolean;
  danger?: number;
}

function MetricCard({ label, value, unit = '', icon, target, lowerIsBetter, danger }: MetricCardProps) {
  // Determine status color
  let statusColor = 'bg-chart-2'; // neutral teal
  
  if (target !== undefined) {
    const isGood = lowerIsBetter ? value <= target : value >= target;
    const isClose = lowerIsBetter 
      ? value <= target * 1.2 
      : value >= target * 0.8;
    
    if (isGood) {
      statusColor = 'bg-green-500';
    } else if (isClose) {
      statusColor = 'bg-yellow-500';
    } else {
      statusColor = 'bg-red-500';
    }
  }
  
  // Check for danger threshold
  if (danger !== undefined) {
    if (lowerIsBetter) {
      if (value >= danger * 0.8) statusColor = 'bg-red-500';
    } else {
      if (value <= danger * 1.5) statusColor = 'bg-red-500';
      if (value <= danger * 1.2) statusColor = 'bg-red-600';
    }
  }
  
  return (
    <div 
      className="relative rounded-lg border border-border bg-card p-3 overflow-hidden"
      data-testid={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColor}`} />
      <div className="flex items-center gap-2 pl-2">
        <div className="text-muted-foreground">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground truncate">
            {label}
          </p>
          <p className="text-xl font-mono font-bold text-foreground">
            {unit === '£' && '£'}
            {Math.round(value)}
            {unit === '%' && '%'}
            {unit === 'ms' && <span className="text-sm font-normal ml-0.5">ms</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

export function MetricsBar() {
  const metrics = useGameStore((state) => state.metrics);
  const currentTurn = useGameStore((state) => state.currentTurn);
  const maxTurns = useGameStore((state) => state.maxTurns);
  
  return (
    <div className="border-b border-border bg-card/50 px-4 py-3">
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2">
          <MascotAuto size="sm" />
          <span className="font-semibold text-foreground">{GAME_TITLE}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          Turn {currentTurn}/{maxTurns}
        </span>
      </div>
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
        <MetricCard
          label="Adoption"
          value={metrics.adoption}
          unit="%"
          icon={<TrendingUp className="w-4 h-4" />}
          target={WIN_CONDITIONS.adoption}
        />
        <MetricCard
          label="Trust"
          value={metrics.trust}
          unit="%"
          icon={<Shield className="w-4 h-4" />}
          target={WIN_CONDITIONS.trust}
          danger={LOSE_THRESHOLDS.trust}
        />
        <MetricCard
          label="Latency"
          value={metrics.latency}
          unit="ms"
          icon={<Zap className="w-4 h-4" />}
          target={WIN_CONDITIONS.maxLatency}
          lowerIsBetter
        />
        <MetricCard
          label="Cost"
          value={metrics.cost}
          unit="£"
          icon={<Coins className="w-4 h-4" />}
          target={WIN_CONDITIONS.maxCostPerTurn}
          lowerIsBetter
        />
        <MetricCard
          label="Governance"
          value={metrics.governanceCoverage}
          unit="%"
          icon={<Scale className="w-4 h-4" />}
          target={WIN_CONDITIONS.governanceCoverage}
        />
        <MetricCard
          label="Reliability"
          value={metrics.reliability}
          unit="%"
          icon={<Server className="w-4 h-4" />}
          target={WIN_CONDITIONS.reliability}
          danger={LOSE_THRESHOLDS.reliability}
        />
        <MetricCard
          label="Political"
          value={metrics.politicalCapital}
          unit="%"
          icon={<Crown className="w-4 h-4" />}
          danger={LOSE_THRESHOLDS.politicalCapital}
        />
        <MetricCard
          label="Support"
          value={metrics.supportLoad}
          unit=""
          icon={<Headphones className="w-4 h-4" />}
          lowerIsBetter
        />
      </div>
    </div>
  );
}

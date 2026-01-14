/**
 * Mascot Component - Archie the Data Architect Coach
 * Inline SVG with 4 expressions: normal, worried, excited, stern
 */

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MASCOT_NAME, MASCOT_PERSONALITY } from '@/lib/gameStrings';
import { useGameStore } from '@/lib/gameStore';

export type MascotExpression = 'normal' | 'worried' | 'excited' | 'stern';

interface MascotProps {
  expression?: MascotExpression;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

// Compute expression based on game state
export function useMascotExpression(): MascotExpression {
  const metrics = useGameStore((state) => state.metrics);
  const phase = useGameStore((state) => state.phase);
  
  if (phase === 'won') return 'excited';
  if (phase === 'lost') return 'worried';
  
  // Worried if trust or reliability critically low
  if (metrics.trust < 40 || metrics.reliability < 40) {
    return 'worried';
  }
  
  // Stern if governance low while adoption high (reckless growth)
  if (metrics.governanceCoverage < 40 && metrics.adoption > 60) {
    return 'stern';
  }
  
  // Excited if all metrics trending well
  if (
    metrics.adoption > 60 &&
    metrics.trust > 60 &&
    metrics.governanceCoverage > 55 &&
    metrics.reliability > 55 &&
    metrics.latency < 1400
  ) {
    return 'excited';
  }
  
  return 'normal';
}

// Expression-specific colours and features
const expressionConfig: Record<MascotExpression, { 
  eyeColor: string;
  mouthPath: string;
  browOffset: number;
  headTilt: number;
}> = {
  normal: {
    eyeColor: '#3b82f6', // Blue
    mouthPath: 'M 18 26 Q 24 30, 30 26', // Slight smile
    browOffset: 0,
    headTilt: 0,
  },
  worried: {
    eyeColor: '#f59e0b', // Amber
    mouthPath: 'M 18 28 Q 24 24, 30 28', // Frown
    browOffset: -2,
    headTilt: -3,
  },
  excited: {
    eyeColor: '#22c55e', // Green
    mouthPath: 'M 16 25 Q 24 32, 32 25', // Big smile
    browOffset: 2,
    headTilt: 5,
  },
  stern: {
    eyeColor: '#ef4444', // Red
    mouthPath: 'M 18 27 L 30 27', // Flat line
    browOffset: -3,
    headTilt: 0,
  },
};

const sizeConfig = {
  sm: { width: 32, height: 32, scale: 0.67 },
  md: { width: 48, height: 48, scale: 1 },
  lg: { width: 64, height: 64, scale: 1.33 },
};

export function Mascot({ expression = 'normal', size = 'md', showName = false, className = '' }: MascotProps) {
  const config = expressionConfig[expression];
  const sizeConf = sizeConfig[size];
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`inline-flex items-center gap-2 ${className}`}>
          <svg
            width={sizeConf.width}
            height={sizeConf.height}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: `rotate(${config.headTilt}deg)` }}
            className="transition-transform duration-300"
            data-testid="mascot-svg"
          >
            {/* Head base - rounded square representing a data architect */}
            <rect
              x="4"
              y="6"
              width="40"
              height="36"
              rx="8"
              className="fill-primary/20 stroke-primary"
              strokeWidth="2"
            />
            
            {/* Glasses frame - architect vibe */}
            <rect
              x="10"
              y="14"
              width="12"
              height="8"
              rx="2"
              className="stroke-foreground"
              strokeWidth="1.5"
              fill="none"
            />
            <rect
              x="26"
              y="14"
              width="12"
              height="8"
              rx="2"
              className="stroke-foreground"
              strokeWidth="1.5"
              fill="none"
            />
            <line x1="22" y1="18" x2="26" y2="18" className="stroke-foreground" strokeWidth="1.5" />
            
            {/* Eyes */}
            <circle
              cx="16"
              cy="18"
              r="3"
              fill={config.eyeColor}
              className="transition-colors duration-300"
            />
            <circle
              cx="32"
              cy="18"
              r="3"
              fill={config.eyeColor}
              className="transition-colors duration-300"
            />
            
            {/* Eye highlights */}
            <circle cx="17" cy="17" r="1" fill="white" />
            <circle cx="33" cy="17" r="1" fill="white" />
            
            {/* Eyebrows */}
            <line
              x1="12"
              y1={10 + config.browOffset}
              x2="20"
              y2={12 + config.browOffset}
              className="stroke-foreground"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="28"
              y1={12 + config.browOffset}
              x2="36"
              y2={10 + config.browOffset}
              className="stroke-foreground"
              strokeWidth="2"
              strokeLinecap="round"
            />
            
            {/* Mouth */}
            <path
              d={config.mouthPath}
              className="stroke-foreground"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            
            {/* Data nodes decoration (architecture symbol) */}
            <circle cx="8" cy="44" r="2" className="fill-primary" />
            <circle cx="24" cy="44" r="2" className="fill-primary" />
            <circle cx="40" cy="44" r="2" className="fill-primary" />
            <line x1="8" y1="44" x2="24" y2="44" className="stroke-primary" strokeWidth="1" />
            <line x1="24" y1="44" x2="40" y2="44" className="stroke-primary" strokeWidth="1" />
          </svg>
          
          {showName && (
            <span className="font-semibold text-foreground text-sm">{MASCOT_NAME}</span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <p className="font-semibold">{MASCOT_NAME}</p>
        <p className="text-xs text-muted-foreground">{MASCOT_PERSONALITY}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// Wrapper that auto-detects expression from game state
export function MascotAuto(props: Omit<MascotProps, 'expression'>) {
  const expression = useMascotExpression();
  return <Mascot {...props} expression={expression} />;
}

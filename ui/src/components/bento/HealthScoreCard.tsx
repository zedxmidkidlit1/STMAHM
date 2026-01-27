/**
 * HealthScoreCard - Displays network health score with circular progress
 */

import { Shield, Wifi, CheckCircle2 } from 'lucide-react';

interface HealthScoreCardProps {
  score: number; // 0-100
  grade: string; // A, B, C, D, F
  status: string;
  breakdown?: {
    security: number;
    stability: number;
    compliance: number;
  };
  insights?: string[];
}

export default function HealthScoreCard({
  score,
  grade,
  status,
  breakdown,
  insights = [],
}: HealthScoreCardProps) {
  // Calculate stroke dashoffset for circular progress
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Get color based on score
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-accent-green';
    if (s >= 60) return 'text-accent-blue';
    if (s >= 40) return 'text-accent-amber';
    return 'text-accent-red';
  };

  const getStrokeColor = (s: number) => {
    if (s >= 80) return '#10B981'; // green
    if (s >= 60) return '#3B82F6'; // blue
    if (s >= 40) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };

  return (
    <div className="flex flex-col h-full">
      {/* Circular Score */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-28 h-28">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-[var(--color-bg-tertiary)]"
            />
            {/* Progress circle */}
            <circle
              cx="56"
              cy="56"
              r="45"
              stroke={getStrokeColor(score)}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">/ 100</span>
          </div>
        </div>
      </div>

      {/* Grade Badge */}
      <div className="text-center mb-4">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(score)} bg-current/10`}>
          Grade: {grade}
        </span>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">{status}</p>
      </div>

      {/* Breakdown (if provided) */}
      {breakdown && (
        <div className="space-y-2 mb-4">
          <ScoreBar label="Security" value={breakdown.security} max={40} icon={<Shield className="w-3 h-3" />} />
          <ScoreBar label="Stability" value={breakdown.stability} max={30} icon={<Wifi className="w-3 h-3" />} />
          <ScoreBar label="Compliance" value={breakdown.compliance} max={30} icon={<CheckCircle2 className="w-3 h-3" />} />
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mt-auto pt-3 border-t border-[var(--color-border)]">
          <div className="space-y-1">
            {insights.slice(0, 3).map((insight, i) => (
              <p key={i} className="text-xs text-[var(--color-text-muted)] truncate">
                {insight}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value, max, icon }: { label: string; value: number; max: number; icon: React.ReactNode }) {
  const percentage = (value / max) * 100;
  
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-[var(--color-text-muted)]">{icon}</span>
      <span className="w-16 text-[var(--color-text-secondary)]">{label}</span>
      <div className="flex-1 h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
        <div 
          className="h-full bg-accent-blue rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-right text-[var(--color-text-muted)]">{value}/{max}</span>
    </div>
  );
}

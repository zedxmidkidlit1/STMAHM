import { motion } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

interface Event {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  timestamp?: string;
}

interface RecentEventsPanelProps {
  events?: Event[];
  maxEvents?: number;
}

// Mock events for demonstration
const mockEvents: Event[] = [
  {
    id: '1',
    type: 'warning',
    message: 'High bandwidth utilization detected on interface eth0',
    timestamp: '2 min ago',
  },
  {
    id: '2',
    type: 'info',
    message: '3 new devices connected to network',
    timestamp: '5 min ago',
  },
  {
    id: '3',
    type: 'success',
    message: 'Network health check completed successfully',
    timestamp: '10 min ago',
  },
];

const eventConfig = {
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-accent-amber/10',
    borderColor: 'border-accent-amber/30',
    iconColor: 'text-accent-amber',
  },
  info: {
    icon: Info,
    bgColor: 'bg-accent-blue/10',
    borderColor: 'border-accent-blue/30',
    iconColor: 'text-accent-blue',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-accent-green/10',
    borderColor: 'border-accent-green/30',
    iconColor: 'text-accent-green',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-accent-red/10',
    borderColor: 'border-accent-red/30',
    iconColor: 'text-accent-red',
  },
};

export default function RecentEventsPanel({ events = mockEvents, maxEvents = 5 }: RecentEventsPanelProps) {
  const displayEvents = events.slice(0, maxEvents);

  return (
    <motion.div
      className="bg-bg-secondary border border-theme rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-text-primary mb-1">Recent Events</h3>
        <p className="text-xs text-text-muted">Latest network activity and alerts</p>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {displayEvents.length === 0 ? (
          <p className="text-center text-text-muted py-8 text-sm">No recent events</p>
        ) : (
          displayEvents.map((event, index) => {
            const config = eventConfig[event.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={event.id}
                className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 ${config.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary leading-relaxed">
                      {event.message}
                    </p>
                    {event.timestamp && (
                      <p className="text-xs text-text-muted mt-1">{event.timestamp}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

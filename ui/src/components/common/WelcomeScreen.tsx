import { motion } from 'framer-motion';
import { Shield, Scan, Loader2, TrendingUp, Activity, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import Titlebar from '../layout/Titlebar';

interface WelcomeScreenProps {
  onStartScan: () => void;
  isScanning?: boolean;
}

const WELCOME_SHOWN_KEY = 'netmapper_welcome_shown';

export default function WelcomeScreen({ onStartScan, isScanning = false }: WelcomeScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleStartScan = () => {
    setIsExiting(true);
    // Mark as shown
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    // Delay to allow fade animation
    setTimeout(() => {
      onStartScan();
    }, 300);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Windows Titlebar Controls - must stay on top */}
      <div className="relative z-50">
        <Titlebar transparent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative">
      {/* Animated Background Orbs - premium light gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-blue-200/40 to-cyan-200/40 blur-3xl"
          style={{ top: '10%', left: '20%' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-cyan-200/40 to-teal-200/40 blur-3xl"
          style={{ bottom: '10%', right: '20%' }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.4, 0.6],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-teal-200/30 to-blue-200/30 blur-3xl"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl px-8 text-center">
        {/* Floating Logo/Icon - Premium Light */}
        <motion.div
          className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-500 via-sky-500 to-teal-500 flex items-center justify-center"
          style={{
            boxShadow: '0 20px 60px rgba(59, 130, 246, 0.3), 0 10px 40px rgba(14, 165, 233, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Shield className="w-14 h-14 text-white drop-shadow-lg" />
        </motion.div>

        {/* App Name - Premium Typography */}
        <div className="mb-6">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-cyan-700 bg-clip-text text-transparent mb-3 tracking-tight leading-tight">
            Network Topology Mapper
          </h1>
          <p className="text-xl text-slate-600 font-medium">
            Professional Network Discovery & Monitoring
          </p>
        </div>

        {/* Feature Highlights - Light Premium */}
        <div className="flex items-center justify-center gap-8 my-12">
          {[
            { icon: Activity, label: 'Real-time Monitoring', color: '#10B981', bgColor: 'bg-emerald-100' },
            { icon: TrendingUp, label: 'Performance Analytics', color: '#3B82F6', bgColor: 'bg-blue-100' },
            { icon: Lock, label: 'Security Assessment', color: '#EF4444', bgColor: 'bg-red-100' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex flex-col items-center gap-3"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${feature.bgColor} shadow-lg`}
                style={{
                  boxShadow: `0 4px 20px ${feature.color}30`,
                }}
              >
                <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
              </div>
              <p className="text-sm text-slate-600 font-semibold">{feature.label}</p>
            </div>
          ))}
        </div>

        {/* Main CTA Button - Premium Light */}
        <div>
          <motion.button
            onClick={handleStartScan}
            disabled={isScanning || isExiting}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-16 py-6 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-teal-600 text-white font-bold text-xl transition-all duration-300 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              boxShadow: isScanning
                ? '0 10px 40px rgba(59, 130, 246, 0.3)'
                : '0 15px 50px rgba(59, 130, 246, 0.4), 0 10px 30px rgba(14, 165, 233, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
          >
            {/* Animated gradient overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: isScanning ? ['-100%', '200%'] : ['0%', '0%'],
              }}
              transition={{
                duration: 1.5,
                repeat: isScanning ? Infinity : 0,
                ease: 'linear',
              }}
            />

            {/* Pulse ring */}
            {!isScanning && !isExiting && (
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-white/70"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {/* Content */}
            <div className="relative z-10 flex items-center gap-4 justify-center">
              {isScanning || isExiting ? (
                <Loader2 className="w-7 h-7 animate-spin drop-shadow-md" />
              ) : (
                <Scan className="w-7 h-7 drop-shadow-md" />
              )}
              <span className="tracking-wide drop-shadow-md">
                {isScanning || isExiting ? 'STARTING...' : 'START NETWORK SCAN'}
              </span>
            </div>
          </motion.button>

          <p className="text-sm text-slate-500 mt-6 font-medium">
            Discover devices, analyze performance, and monitor network health
          </p>
        </div>
      </div>
      </div>
    </motion.div>
  );
}

// Hook to check if welcome should be shown
export function useWelcomeScreen() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const hasShown = localStorage.getItem(WELCOME_SHOWN_KEY);
    setShouldShow(!hasShown);
  }, []);

  const markAsShown = () => {
    setShouldShow(false);
  };

  return { shouldShow, markAsShown };
}

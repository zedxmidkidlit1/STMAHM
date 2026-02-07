import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectOption {
  value: number | string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: number | string;
  onChange: (value: number) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select...',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: number | string) => {
    onChange(Number(optionValue));
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="bg-bg-secondary text-text-primary text-xs rounded-lg px-3 py-1.5 pr-8 border border-border-subtle hover:border-accent-blue/50 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer min-w-[110px] text-left"
      >
        {selectedOption?.label || placeholder}
        <ChevronDown
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full bg-bg-secondary border border-border-subtle rounded-lg shadow-xl overflow-hidden backdrop-blur-xl"
          >
            <div className="py-1 max-h-60 overflow-y-auto">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-accent-blue/20 text-accent-blue'
                        : 'text-text-primary hover:bg-bg-hover'
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

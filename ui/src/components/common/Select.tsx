/**
 * Modern Select Component
 * Custom dropdown with search and keyboard navigation
 */

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
 label?: string;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  fullWidth = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Filter options based on search
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={clsx('relative', fullWidth && 'w-full')}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          'w-full flex items-center justify-between gap-2',
          'px-4 py-2.5 rounded-lg',
          'bg-bg-tertiary text-text-primary',
          'border transition-all duration-200',
          'focus:outline-none focus:ring-2',
          error ? 'border-accent-red focus:ring-accent-red' : 'border-theme focus:ring-accent-blue',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:bg-bg-hover cursor-pointer'
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          <span className={clsx(!selectedOption && 'text-text-muted')}>
            {selectedOption?.label || placeholder}
          </span>
        </span>
        <ChevronDown
          className={clsx(
            'w-4 h-4 text-text-muted transition-transform shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-accent-red mt-1">{error}</p>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-bg-secondary border border-theme rounded-lg shadow-xl overflow-hidden"
          >
            {/* Search Input */}
            {options.length > 5 && (
              <div className="p-2 border-b border-theme">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  autoFocus
                  className="w-full px-3 py-2 bg-bg-tertiary rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-text-muted text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    className={clsx(
                      'w-full flex items-center justify-between gap-2 px-4 py-2.5',
                      'text-left transition-colors',
                      option.disabled && 'opacity-50 cursor-not-allowed',
                      !option.disabled && 'hover:bg-bg-tertiary cursor-pointer',
                      option.value === value && 'bg-accent-blue/10 text-accent-blue'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {option.icon}
                      <span>{option.label}</span>
                    </span>
                    {option.value === value && (
                      <Check className="w-4 h-4 text-accent-blue" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

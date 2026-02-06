import { useState, useEffect, useRef } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
  className?: string;
  disabled?: boolean;
}

export function CurrencyInput({
  value,
  onChange,
  compact = false,
  className = '',
  disabled = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(formatForDisplay(value));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatForDisplay(value));
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number when editing
    setDisplayValue(value === 0 ? '' : value.toString());
    // Select all text
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numValue = parseFloat(displayValue.replace(/[^0-9.-]/g, '')) || 0;
    onChange(numValue);
    setDisplayValue(formatForDisplay(numValue));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow numbers, decimal point, and negative sign
    if (/^-?\d*\.?\d*$/.test(raw) || raw === '') {
      setDisplayValue(raw);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
      return;
    }
    
    // Arrow navigation between fields
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const input = inputRef.current;
      if (!input) return;
      
      const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
      const atEnd = input.selectionStart === input.value.length && input.selectionEnd === input.value.length;
      
      // Navigate only when cursor is at start/end
      if ((e.key === 'ArrowLeft' && atStart) || (e.key === 'ArrowRight' && atEnd)) {
        e.preventDefault();
        e.stopPropagation();
        
        const row = input.closest('[data-row-index]');
        if (!row) return;
        
        const focusableSelector = 'button, input, [tabindex]:not([tabindex="-1"])';
        const focusables = Array.from(row.querySelectorAll(focusableSelector)) as HTMLElement[];
        const currentIndex = focusables.indexOf(input);
        
        if (currentIndex === -1) return;
        
        const nextIndex = e.key === 'ArrowRight' 
          ? Math.min(currentIndex + 1, focusables.length - 1)
          : Math.max(currentIndex - 1, 0);
        
        if (nextIndex !== currentIndex) {
          focusables[nextIndex].focus();
        }
      }
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`
        w-full text-right rounded border border-gray-300 bg-white
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        disabled:bg-gray-100 disabled:text-gray-500
        ${compact ? 'px-1.5 py-1 text-xs' : 'px-2 py-1.5 text-sm'}
        ${className}
      `}
    />
  );
}

function formatForDisplay(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

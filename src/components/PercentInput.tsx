import { useState, useEffect, useRef } from 'react';

interface PercentInputProps {
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
  className?: string;
}

export function PercentInput({
  value,
  onChange,
  compact = false,
  className = '',
}: PercentInputProps) {
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
    setDisplayValue(value === 0 ? '' : value.toString());
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
    let numValue = parseFloat(displayValue) || 0;
    // Clamp between 0 and 100
    numValue = Math.max(0, Math.min(100, numValue));
    onChange(numValue);
    setDisplayValue(formatForDisplay(numValue));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (/^\d*\.?\d*$/.test(raw) || raw === '') {
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
    <div className={`flex items-center gap-1 ${className}`}>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`
          flex-1 text-right rounded border border-gray-300 bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${compact ? 'px-1.5 py-1 text-xs w-10' : 'px-2 py-1.5 text-sm w-12'}
        `}
      />
      <span className={`text-gray-400 flex-shrink-0 ${compact ? 'text-xs' : 'text-sm'}`}>
        %
      </span>
    </div>
  );
}

function formatForDisplay(value: number): string {
  // Remove trailing zeros but keep at least one decimal place for whole numbers
  return value % 1 === 0 ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '');
}

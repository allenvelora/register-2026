import { useRef } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';

interface Option {
  id: string;
  label: string;
}

interface SelectFieldProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  compact?: boolean;
  className?: string;
}

export function SelectField({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  compact = false,
  className = '',
}: SelectFieldProps) {
  const selectedOption = options.find((opt) => opt.id === value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle arrow key navigation between fields
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Only handle if the dropdown is not open (Headless UI adds data-open when open)
      const button = containerRef.current?.querySelector('button');
      const isOpen = button?.getAttribute('data-open') !== null;
      
      if (!isOpen) {
        e.preventDefault();
        e.stopPropagation();
        
        // Get all focusable elements in the row
        const row = containerRef.current?.closest('[data-row-index]');
        if (!row) return;
        
        const focusableSelector = 'button, input, [tabindex]:not([tabindex="-1"])';
        const focusables = Array.from(row.querySelectorAll(focusableSelector)) as HTMLElement[];
        const currentIndex = focusables.indexOf(button!);
        
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
    <Listbox value={value} onChange={onChange}>
      <div ref={containerRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
        <ListboxButton
          className={`
            relative w-full cursor-pointer rounded border border-gray-300 bg-white text-left
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${compact ? 'py-1 pl-2 pr-6 text-xs' : 'py-1.5 pl-2 pr-8 text-sm'}
          `}
        >
          <span className={`block truncate ${!selectedOption ? 'text-gray-400' : ''}`}>
            {selectedOption?.label || placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5">
            <ChevronIcon className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400`} />
          </span>
        </ListboxButton>

        <ListboxOptions
          className="absolute z-10 mt-1 max-h-60 w-64 overflow-auto rounded-md bg-white py-1 text-sm text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none"
          anchor="bottom start"
        >
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <ListboxOption
                key={option.id}
                value={option.id}
                className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-blue-50 data-[focus]:text-blue-900"
              >
                <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                  {option.label}
                </span>
                {isSelected && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                )}
              </ListboxOption>
            );
          })}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

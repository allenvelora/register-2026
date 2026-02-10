import { useState, useRef, useEffect, useCallback } from 'react';
import type { ControlPanelState } from '../hooks/useControlPanel';

interface ControlPanelProps {
  state: ControlPanelState;
  updateState: <K extends keyof ControlPanelState>(key: K, value: ControlPanelState[K]) => void;
  resetToDefaults: () => void;
  isMinimized: boolean;
  toggleMinimized: () => void;
}

export function ControlPanel({
  state,
  updateState,
  resetToDefaults,
  isMinimized,
  toggleMinimized,
}: ControlPanelProps) {
  const [position, setPosition] = useState({ x: 16, y: window.innerHeight - 400 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, label')) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={panelRef}
      className={`fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? 'auto' : '280px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-t-lg border-b border-gray-200"
        onMouseDown={handleMouseDown}
      >
        <span className="text-sm font-medium text-gray-700">Design Controls</span>
        <div className="flex items-center gap-1">
          <button
            onClick={resetToDefaults}
            className="p-1 text-gray-400 hover:text-gray-600 text-xs"
            title="Reset to defaults"
          >
            ↺
          </button>
          <button
            onClick={toggleMinimized}
            className="p-1 text-gray-400 hover:text-gray-600"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '□' : '─'}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-3 space-y-4">
          {/* Column Visibility Section */}
          <Section title="Column Visibility">
            <SliderControl
              label="Tag Columns"
              value={state.tagColumnCount}
              min={0}
              max={5}
              onChange={(v) => updateState('tagColumnCount', v)}
            />
          </Section>

          {/* Layout Section */}
          <Section title="Layout">
            <ToggleControl
              label="Consolidated Footer"
              checked={state.footerLayout === 'consolidated'}
              onChange={(v) => updateState('footerLayout', v ? 'consolidated' : 'default')}
            />
          </Section>

          {/* Display Section */}
          <Section title="Display">
            <ToggleControl
              label="Compact Mode"
              checked={state.compactMode}
              onChange={(v) => updateState('compactMode', v)}
            />
            <RadioGroup
              label="Tags"
              options={[
                { value: 'text', label: 'Text' },
                { value: 'pills-inline', label: 'Inline' },
                { value: 'pills', label: 'Pills' },
              ]}
              value={state.tagDisplayMode}
              onChange={(v) => updateState('tagDisplayMode', v as ControlPanelState['tagDisplayMode'])}
            />
            <RadioGroup
              label="Tag Names"
              options={[
                { value: 'truncate-tooltip', label: 'Truncate' },
                { value: 'code-only', label: 'Code' },
              ]}
              value={state.tagNameDisplay}
              onChange={(v) => updateState('tagNameDisplay', v as ControlPanelState['tagNameDisplay'])}
            />
          </Section>

          {/* Testing Section */}
          <Section title="Testing">
            <ToggleControl
              label="Long Tag Names"
              checked={state.longTagNames}
              onChange={(v) => updateState('longTagNames', v)}
            />
            <ToggleControl
              label="Tag Tooltips"
              checked={state.showTagTooltips}
              onChange={(v) => updateState('showTagTooltips', v)}
            />
          </Section>
        </div>
      )}
    </div>
  );
}

// Sub-components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-sm text-gray-600 whitespace-nowrap">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <span className="text-sm font-medium text-gray-700 w-4 text-right">{value}</span>
      </div>
    </div>
  );
}

function ToggleControl({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
      </div>
    </label>
  );
}

function RadioGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              value === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

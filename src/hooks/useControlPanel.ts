import { useState, useCallback } from 'react';

export interface ControlPanelState {
  // Page
  activePage: 'transactions' | 'reports';

  // Column visibility
  tagColumnCount: number; // 0-5
  
  // Layout
  footerLayout: 'default' | 'consolidated';
  
  // Display
  compactMode: boolean;
  tagDisplayMode: 'text' | 'pills' | 'pills-inline';
  tagNameDisplay: 'truncate-tooltip' | 'code-only';

  // Testing
  longTagNames: boolean;
  showTagTooltips: boolean;
}

const defaultState: ControlPanelState = {
  activePage: 'transactions',
  tagColumnCount: 3,
  footerLayout: 'default',
  compactMode: false,
  tagDisplayMode: 'text',
  tagNameDisplay: 'truncate-tooltip',
  longTagNames: false,
  showTagTooltips: true,
};

export function useControlPanel() {
  const [state, setState] = useState<ControlPanelState>(defaultState);
  const [isMinimized, setIsMinimized] = useState(false);

  const updateState = useCallback(<K extends keyof ControlPanelState>(
    key: K,
    value: ControlPanelState[K]
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setState(defaultState);
  }, []);

  const toggleMinimized = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  // Derived values
  const visibleTagColumns = getVisibleTagColumns(state.tagColumnCount);

  return {
    state,
    updateState,
    resetToDefaults,
    isMinimized,
    toggleMinimized,
    visibleTagColumns,
  };
}

// Tag column order: Programs, Events, Departments, Custom, 990
const TAG_COLUMN_ORDER = ['programs', 'events', 'departments', 'custom', '990'] as const;

function getVisibleTagColumns(count: number): string[] {
  // Return columns based on count (0-5)
  return TAG_COLUMN_ORDER.slice(0, count);
}

export type { ControlPanelState as ControlState };

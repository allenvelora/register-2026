import { useState, useCallback } from 'react';

export interface ControlPanelState {
  // Page
  activePage: 'transactions' | 'reports';

  // Column visibility
  tagColumnCount: number; // 0-5
  
  // Layout
  containerWidth: '1080' | '1280' | '1440' | 'full';
  footerLayout: 'default' | 'consolidated';
  
  // Display
  compactMode: boolean;
  tagDisplayMode: 'text' | 'pills' | 'pills-inline';
  tagNameDisplay: 'full' | 'truncate-tooltip' | 'code-only';

  // Testing
  longTagNames: boolean;
}

const defaultState: ControlPanelState = {
  activePage: 'transactions',
  tagColumnCount: 3,
  containerWidth: '1280',
  footerLayout: 'default',
  compactMode: false,
  tagDisplayMode: 'text',
  tagNameDisplay: 'full',
  longTagNames: false,
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
  const containerWidthPx = getContainerWidthPx(state.containerWidth);

  return {
    state,
    updateState,
    resetToDefaults,
    isMinimized,
    toggleMinimized,
    visibleTagColumns,
    containerWidthPx,
  };
}

// Tag column order: Programs, Events, Departments, Custom, 990
const TAG_COLUMN_ORDER = ['programs', 'events', 'departments', 'custom', '990'] as const;

function getVisibleTagColumns(count: number): string[] {
  // Return columns based on count (0-5)
  return TAG_COLUMN_ORDER.slice(0, count);
}

function getContainerWidthPx(width: ControlPanelState['containerWidth']): string {
  switch (width) {
    case '1080':
      return '1080px';
    case '1280':
      return '1280px';
    case '1440':
      return '1440px';
    case 'full':
      return '100%';
  }
}

export type { ControlPanelState as ControlState };

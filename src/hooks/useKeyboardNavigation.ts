import { useEffect, useCallback, useRef } from 'react';

interface UseKeyboardNavigationOptions {
  containerSelector: string;
  rowSelector: string;
  cellSelector: string;
  onAddRow?: () => void;
}

/**
 * Custom hook for keyboard navigation in a grid/table
 * 
 * Supports:
 * - Tab/Shift+Tab: Move between cells
 * - Arrow Up/Down: Move between rows (when in a cell)
 * - Enter: Confirm selection in dropdowns, or add new row when on add button
 * - Escape: Close dropdowns
 */
export function useKeyboardNavigation({
  containerSelector,
  rowSelector,
  cellSelector,
  onAddRow,
}: UseKeyboardNavigationOptions) {
  const currentRowIndex = useRef(0);
  const currentCellIndex = useRef(0);

  const getFocusableElements = useCallback((container: Element) => {
    return container.querySelectorAll<HTMLElement>(
      'input:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  }, []);

  const getRows = useCallback(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return [];
    return Array.from(container.querySelectorAll(rowSelector));
  }, [containerSelector, rowSelector]);

  const getCellsInRow = useCallback(
    (row: Element) => {
      return Array.from(row.querySelectorAll(cellSelector));
    },
    [cellSelector]
  );

  const focusCell = useCallback(
    (rowIndex: number, cellIndex: number) => {
      const rows = getRows();
      if (rowIndex < 0 || rowIndex >= rows.length) return;

      const row = rows[rowIndex];
      const cells = getCellsInRow(row);
      if (cellIndex < 0 || cellIndex >= cells.length) return;

      const cell = cells[cellIndex];
      const focusable = getFocusableElements(cell);
      if (focusable.length > 0) {
        focusable[0].focus();
        currentRowIndex.current = rowIndex;
        currentCellIndex.current = cellIndex;
      }
    },
    [getRows, getCellsInRow, getFocusableElements]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const container = document.querySelector(containerSelector);
      
      // Ctrl/Cmd + Enter: Add new row (works from anywhere in the container)
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && onAddRow) {
        // Check if we're within the distribution table container or its parent form
        const isInContainer = container && (container.contains(target) || target.closest('[data-distribution-table]'));
        if (isInContainer) {
          e.preventDefault();
          onAddRow();
          return;
        }
      }

      const rows = getRows();
      
      // Find current row and cell
      const currentRow = target.closest(rowSelector);
      if (!currentRow) return;

      const rowIndex = rows.indexOf(currentRow);
      if (rowIndex === -1) return;

      const cells = getCellsInRow(currentRow);
      const currentCell = target.closest(cellSelector);
      const cellIndex = currentCell ? cells.indexOf(currentCell) : -1;

      // Arrow Up: Move to same cell in previous row
      if (e.key === 'ArrowUp' && !e.altKey && rowIndex > 0) {
        // Only if not in a dropdown
        const isInDropdown = target.closest('[role="listbox"]');
        if (!isInDropdown) {
          e.preventDefault();
          focusCell(rowIndex - 1, cellIndex);
        }
      }

      // Arrow Down: Move to same cell in next row
      if (e.key === 'ArrowDown' && !e.altKey && rowIndex < rows.length - 1) {
        const isInDropdown = target.closest('[role="listbox"]');
        if (!isInDropdown) {
          e.preventDefault();
          focusCell(rowIndex + 1, cellIndex);
        }
      }
    },
    [containerSelector, getRows, getCellsInRow, rowSelector, cellSelector, focusCell, onAddRow]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    focusCell,
    currentRowIndex: currentRowIndex.current,
    currentCellIndex: currentCellIndex.current,
  };
}

/**
 * Keyboard shortcut hints for the UI
 */
export const KEYBOARD_SHORTCUTS = [
  { keys: ['Tab'], description: 'Move to next field' },
  { keys: ['Shift', 'Tab'], description: 'Move to previous field' },
  { keys: ['↑', '↓'], description: 'Move between rows' },
  { keys: ['Ctrl/⌘', 'Enter'], description: 'Add new split' },
  { keys: ['Esc'], description: 'Close dropdown' },
];

import { useEffect, useState, useMemo } from 'react';
import { SplitRow } from './SplitRow';
import { tagCategories, getTagCategoriesWithLongNames, formatCurrency, createEmptySplit, type Split } from '../data/mockData';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

interface DistributionTableProps {
  splits: Split[];
  onChange: (splits: Split[]) => void;
  totalAmount: number;
  visibleTagColumns: string[];
  showLineDescription: boolean;
  compact: boolean;
  tagDisplayMode: 'text' | 'pills' | 'pills-inline';
  tagNameDisplay?: 'full' | 'truncate-tooltip' | 'code-only';
  longTagNames?: boolean;
  showTagDetails?: boolean;
  hideFooter?: boolean;
  onAddSplit?: () => void;
}

export function DistributionTable({
  splits,
  onChange,
  totalAmount,
  visibleTagColumns,
  showLineDescription,
  compact,
  tagDisplayMode,
  tagNameDisplay = 'full',
  longTagNames = false,
  showTagDetails = false,
  hideFooter = false,
  onAddSplit,
}: DistributionTableProps) {
  const activeTagCategories = useMemo(
    () => (longTagNames ? getTagCategoriesWithLongNames() : tagCategories),
    [longTagNames]
  );

  // Drag and drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleSplitChange = (index: number, updatedSplit: Split) => {
    const newSplits = [...splits];
    newSplits[index] = updatedSplit;
    onChange(newSplits);
  };

  const handleDeleteSplit = (index: number) => {
    if (splits.length <= 1) return;
    const newSplits = splits.filter((_, i) => i !== index);
    onChange(newSplits);
  };

  const handleAddSplit = () => {
    if (onAddSplit) {
      onAddSplit();
    } else {
      const newSplit = createEmptySplit(totalAmount, splits);
      onChange([...splits, newSplit]);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (dragIndex !== null && dragIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      // Reorder the splits
      const newSplits = [...splits];
      const [draggedItem] = newSplits.splice(dragIndex, 1);
      newSplits.splice(dragOverIndex, 0, draggedItem);
      onChange(newSplits);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // Keyboard navigation
  const { focusCell } = useKeyboardNavigation({
    containerSelector: '[data-distribution-table]',
    rowSelector: '[data-row-index]',
    cellSelector: '[data-cell]',
    onAddRow: handleAddSplit,
  });

  // Focus the first cell of a new row when added
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      const lastIndex = splits.length - 1;
      if (lastIndex > 0) {
        // Focus account field (first cell)
        focusCell(lastIndex, 0);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [splits.length]);

  // Calculate remaining balance
  const allocatedAmount = splits.reduce((sum, s) => sum + s.amount, 0);
  const remainingBalance = totalAmount - allocatedAmount;

  const cellPadding = compact ? 'px-1.5 py-1' : 'px-2 py-1.5';
  const headerText = compact ? 'text-[10px]' : 'text-xs';

  return (
    <div className="space-y-2">
      {/* Table with actions outside */}
      <div className="relative" data-distribution-table>
        {/* Header */}
        <div className="flex bg-gray-50 border-t border-b border-gray-200">
          <div className={`${cellPadding} ${headerText} font-medium text-gray-500 text-left flex-1 min-w-[120px]`}>
            Account
          </div>
          <div className={`${cellPadding} ${headerText} font-medium text-gray-500 text-left flex-1 min-w-[100px]`}>
            Fund
          </div>
          {visibleTagColumns.map((categoryId) => {
            const category = activeTagCategories.find((c) => c.id === categoryId);
            return (
              <div
                key={categoryId}
                className={`${cellPadding} ${headerText} font-medium text-gray-500 text-left flex-1 min-w-[100px]`}
              >
                <span className="truncate block">{category?.name || categoryId}</span>
              </div>
            );
          })}
          {showLineDescription && (
            <div className={`${cellPadding} ${headerText} font-medium text-gray-500 text-left flex-1 min-w-[100px]`}>
              Line Description
            </div>
          )}
          <div className={`${cellPadding} ${headerText} font-medium text-gray-500 text-right w-[70px] flex-shrink-0`}>
            %
          </div>
          <div className={`${cellPadding} ${headerText} font-medium text-gray-500 text-right w-[110px] flex-shrink-0`}>
            Amount
          </div>
        </div>

        {/* Body rows */}
        <div className="border-b border-gray-200">
          {splits.map((split, index) => (
            <SplitRow
              key={split.id}
              split={split}
              onChange={(s) => handleSplitChange(index, s)}
              onDelete={() => handleDeleteSplit(index)}
              visibleTagColumns={visibleTagColumns}
              showLineDescription={showLineDescription}
              compact={compact}
              tagDisplayMode={tagDisplayMode}
              tagNameDisplay={tagNameDisplay}
              longTagNames={longTagNames}
              showTagDetails={showTagDetails}
              totalAmount={totalAmount}
              rowIndex={index}
              canDelete={splits.length > 1}
              canDrag={splits.length > 1}
              isDragging={dragIndex === index}
              isDragOver={dragOverIndex === index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      </div>

      {/* Footer: Add split button + Remaining balance */}
      {!hideFooter && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleAddSplit}
              className={`
                inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium
                border border-blue-200 rounded px-3 py-1.5 hover:bg-blue-50 transition-colors
                ${compact ? 'text-xs' : 'text-sm'}
              `}
            >
              <PlusIcon className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
              {splits.length === 1 ? 'Create split' : 'Add split'}
            </button>

            {/* Keyboard shortcut hint */}
            <span className={`text-gray-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">Ctrl</kbd>
              +
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">Enter</kbd>
              {' '}to add split
            </span>
          </div>

          <div className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
            Remaining balance:{' '}
            <span
              className={`font-medium ${
                Math.abs(remainingBalance) < 0.01
                  ? 'text-green-600'
                  : remainingBalance > 0
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}
            >
              {formatCurrency(remainingBalance)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

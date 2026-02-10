import { SelectField } from './SelectField';
import { TagSelect } from './TagSelect';
import { CurrencyInput } from './CurrencyInput';
import { PercentInput } from './PercentInput';
import {
  accounts,
  funds,
  tagCategories,
  getTagCategoriesWithLongNames,
  formatAccountDisplay,
  formatFundDisplay,
  type Split,
} from '../data/mockData';

interface SplitRowProps {
  split: Split;
  onChange: (split: Split) => void;
  onDelete?: () => void;
  visibleTagColumns: string[];
  showLineDescription: boolean;
  compact: boolean;
  tagDisplayMode: 'text' | 'pills' | 'pills-inline';
  tagNameDisplay?: 'truncate-tooltip' | 'code-only';
  longTagNames?: boolean;
  showTagDetails?: boolean;
  showTagTooltips?: boolean;
  totalAmount: number;
  rowIndex: number;
  canDelete: boolean;
  canDrag: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (index: number) => void;
  onDragOver?: (index: number) => void;
  onDragEnd?: () => void;
}

export function SplitRow({
  split,
  onChange,
  onDelete,
  visibleTagColumns,
  showLineDescription,
  compact,
  tagDisplayMode,
  tagNameDisplay = 'truncate-tooltip',
  longTagNames = false,
  showTagDetails = false,
  showTagTooltips = true,
  totalAmount,
  rowIndex,
  canDelete,
  canDrag,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragEnd,
}: SplitRowProps) {
  const accountOptions = accounts.map((a) => ({
    id: a.id,
    label: formatAccountDisplay(a),
  }));

  const fundOptions = funds.map((f) => ({
    id: f.id,
    label: formatFundDisplay(f),
  }));

  const handleFieldChange = <K extends keyof Split>(field: K, value: Split[K]) => {
    const updated = { ...split, [field]: value };

    // Auto-calculate amount when percentage changes
    if (field === 'percentage') {
      updated.amount = (totalAmount * (value as number)) / 100;
    }
    // Auto-calculate percentage when amount changes
    if (field === 'amount' && totalAmount > 0) {
      updated.percentage = ((value as number) / totalAmount) * 100;
    }

    onChange(updated);
  };

  const activeTagCategories = longTagNames ? getTagCategoriesWithLongNames() : tagCategories;

  const getTagsForCategory = (categoryId: string) => {
    const category = activeTagCategories.find((c) => c.id === categoryId);
    return category?.tags || [];
  };

  const getSelectedTagIds = (categoryId: string): string[] => {
    switch (categoryId) {
      case 'programs':
        return split.programIds;
      case 'events':
        return split.eventIds;
      case 'departments':
        return split.departmentIds;
      case 'custom':
        return split.customIds;
      case '990':
        return split.nineNinetyIds;
      default:
        return [];
    }
  };

  const handleTagChange = (categoryId: string, ids: string[]) => {
    switch (categoryId) {
      case 'programs':
        handleFieldChange('programIds', ids);
        break;
      case 'events':
        handleFieldChange('eventIds', ids);
        break;
      case 'departments':
        handleFieldChange('departmentIds', ids);
        break;
      case 'custom':
        handleFieldChange('customIds', ids);
        break;
      case '990':
        handleFieldChange('nineNinetyIds', ids);
        break;
    }
  };

  const cellPadding = compact ? 'px-1.5 py-1' : 'px-2 py-1.5';

  // Get tag detail for a specific category (for column-aligned detail strip)
  const getTagDetailForCategory = (categoryId: string) => {
    const category = activeTagCategories.find((c) => c.id === categoryId);
    if (!category) return null;
    const ids = getSelectedTagIds(categoryId);
    if (ids.length === 0) return null;
    const tags = category.tags.filter((t) => ids.includes(t.id));
    return tags;
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(rowIndex));
    onDragStart?.(rowIndex);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver?.(rowIndex);
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  return (
    <>
    <div
      className={`
        group relative flex items-center transition-colors
        ${isDragging ? 'opacity-50 bg-blue-50' : 'hover:bg-gray-50'}
        ${isDragOver ? 'ring-2 ring-blue-500 ring-inset' : ''}
        ${rowIndex > 0 ? 'border-t border-gray-100' : ''}
      `}
      data-row-index={rowIndex}
      draggable={canDrag}
      onDragStart={canDrag ? handleDragStart : undefined}
      onDragOver={canDrag ? handleDragOver : undefined}
      onDragEnd={canDrag ? handleDragEnd : undefined}
    >
      {/* Drag handle - positioned outside left, visible on hover when canDrag */}
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 flex items-center justify-center">
        {canDrag && (
          <span className="text-gray-300 cursor-grab active:cursor-grabbing select-none opacity-0 group-hover:opacity-100 transition-opacity">
            ⋮⋮
          </span>
        )}
      </div>

      {/* Row content */}
      <div className="flex flex-1 items-center min-w-0">
        {/* Account */}
        <div className={`${cellPadding} flex-1 min-w-[120px]`} data-cell>
          <SelectField
            value={split.accountId}
            options={accountOptions}
            onChange={(v) => handleFieldChange('accountId', v)}
            placeholder="Account"
            compact={compact}
          />
        </div>

        {/* Fund */}
        <div className={`${cellPadding} flex-1 min-w-[100px]`} data-cell>
          <SelectField
            value={split.fundId}
            options={fundOptions}
            onChange={(v) => handleFieldChange('fundId', v)}
            placeholder="Fund"
            compact={compact}
          />
        </div>

        {/* Tag columns */}
        {visibleTagColumns.map((categoryId) => {
          const category = activeTagCategories.find((c) => c.id === categoryId);
          return (
            <div key={categoryId} className={`${cellPadding} flex-1 min-w-[100px]`} data-cell>
              <TagSelect
                selectedIds={getSelectedTagIds(categoryId)}
                options={getTagsForCategory(categoryId)}
                onChange={(ids) => handleTagChange(categoryId, ids)}
                placeholder={category?.name || ''}
                compact={compact}
                displayMode={tagDisplayMode}
                nameDisplay={tagNameDisplay}
                showTooltips={showTagTooltips}
              />
            </div>
          );
        })}

        {/* Line Description */}
        {showLineDescription && (
          <div className={`${cellPadding} flex-1 min-w-[100px]`} data-cell>
            <input
              type="text"
              value={split.lineDescription}
              onChange={(e) => handleFieldChange('lineDescription', e.target.value)}
              placeholder="Description"
              className={`
                w-full rounded border border-gray-300 bg-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${compact ? 'px-1.5 py-1 text-xs' : 'px-2 py-1.5 text-sm'}
              `}
            />
          </div>
        )}

        {/* Percentage */}
        <div className={`${cellPadding} w-[70px] flex-shrink-0`} data-cell>
          <PercentInput
            value={split.percentage}
            onChange={(v) => handleFieldChange('percentage', v)}
            compact={compact}
          />
        </div>

        {/* Amount */}
        <div className={`${cellPadding} w-[110px] flex-shrink-0`} data-cell>
          <CurrencyInput
            value={split.amount}
            onChange={(v) => handleFieldChange('amount', v)}
            compact={compact}
          />
        </div>
      </div>

      {/* Delete button - positioned outside right, visible on hover when canDelete */}
      <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-6 flex items-center justify-center">
        {canDelete && (
          <button
            onClick={onDelete}
            className="p-0.5 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
            title="Delete split"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>

    {/* Tag detail strip — column-aligned with the row above */}
    {showTagDetails && (
      <div className="flex bg-gray-50/80 border-t border-gray-100">
        {/* Account spacer */}
        <div className={`${cellPadding} flex-1 min-w-[120px]`} />
        {/* Fund spacer */}
        <div className={`${cellPadding} flex-1 min-w-[100px]`} />
        {/* Tag detail columns — one per visible tag category */}
        {visibleTagColumns.map((categoryId) => {
          const tags = getTagDetailForCategory(categoryId);
          return (
            <div
              key={categoryId}
              className={`${cellPadding} flex-1 min-w-[100px] ${compact ? 'text-[10px]' : 'text-xs'}`}
            >
              {tags && tags.length > 0 ? (
                <div className="space-y-0.5">
                  {tags.map((t) => (
                    <div key={t.code} className="text-gray-600 leading-snug">
                      <span className="font-medium text-gray-500">{t.code}</span>
                      <span className="text-gray-400"> — </span>
                      <span>{t.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-300">—</span>
              )}
            </div>
          );
        })}
        {/* Line description spacer */}
        {showLineDescription && <div className={`${cellPadding} flex-1 min-w-[100px]`} />}
        {/* % spacer */}
        <div className={`${cellPadding} w-[70px] flex-shrink-0`} />
        {/* Amount spacer */}
        <div className={`${cellPadding} w-[110px] flex-shrink-0`} />
      </div>
    )}
    </>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

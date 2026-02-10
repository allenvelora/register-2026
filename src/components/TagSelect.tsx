import { useState, useRef, useEffect, useCallback } from 'react';
import type { Tag } from '../data/mockData';

interface TagSelectProps {
  selectedIds: string[];
  options: Tag[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  compact?: boolean;
  className?: string;
  displayMode?: 'text' | 'pills' | 'pills-inline';
  nameDisplay?: 'truncate-tooltip' | 'code-only';
  showTooltips?: boolean;
}

export function TagSelect({
  selectedIds,
  options,
  onChange,
  placeholder = '—',
  compact = false,
  className = '',
  displayMode = 'text',
  nameDisplay = 'truncate-tooltip',
  showTooltips = true,
}: TagSelectProps) {
  // Tag name formatting helpers
  const formatTagLabel = (tag: Tag) => {
    switch (nameDisplay) {
      case 'code-only': return tag.code;
      case 'truncate-tooltip': default: return `${tag.code} - ${tag.name}`;
    }
  };
  const fullTagLabel = (tag: Tag) => `${tag.code} - ${tag.name}`;
  const isTruncate = nameDisplay === 'truncate-tooltip';

  const [isOpen, setIsOpen] = useState(false);
  const [showTagsPopover, setShowTagsPopover] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close dropdown and optionally return focus to trigger
  const closeDropdown = useCallback((returnFocus = false) => {
    setIsOpen(false);
    setQuery('');
    setHighlightedIndex(0);
    if (returnFocus && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, []);

  // Close popovers when clicking outside
  useEffect(() => {
    if (!isOpen && !showTagsPopover) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isOpen) closeDropdown();
        if (showTagsPopover) setShowTagsPopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, showTagsPopover, closeDropdown]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const selectedTags = options.filter((t) => selectedIds.includes(t.id));
  
  const filteredOptions = query === ''
    ? options
    : options.filter(
        (tag) =>
          tag.name.toLowerCase().includes(query.toLowerCase()) ||
          tag.code.toLowerCase().includes(query.toLowerCase())
      );

  // Reset highlighted index when query changes or options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedElement = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleToggle = useCallback((tagId: string) => {
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedIds, tagId]);
    }
  }, [selectedIds, onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation(); // Prevent focus from moving to next row
        setHighlightedIndex((prev) => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation(); // Prevent focus from moving to previous row
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        // Toggle highlighted option if there are options
        if (filteredOptions.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          handleToggle(filteredOptions[highlightedIndex].id);
        } else if (query === '') {
          // No options and no query - close
          e.preventDefault();
          e.stopPropagation();
          closeDropdown(true);
        }
        break;
      case ' ':
        // Space only toggles if not typing (query is empty)
        if (query === '' && filteredOptions.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          handleToggle(filteredOptions[highlightedIndex].id);
        }
        // If query is not empty, let space type normally
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        closeDropdown(true);
        break;
      case 'Tab':
        closeDropdown();
        // Don't prevent default - let Tab move focus to next field
        break;
    }
  }, [isOpen, filteredOptions, highlightedIndex, query, closeDropdown, handleToggle]);

  // Display text: format based on nameDisplay mode
  const getDisplayText = () => {
    if (selectedTags.length === 0) return placeholder;
    if (selectedTags.length === 1) return formatTagLabel(selectedTags[0]);
    return `${selectedTags.length} Tags`;
  };
  const displayText = getDisplayText();
  const displayTooltip = showTooltips && selectedTags.length === 1 && isTruncate ? fullTagLabel(selectedTags[0]) : undefined;

  const handleRemoveTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((id) => id !== tagId));
  };

  // Get pill display text
  const getPillDisplayText = () => {
    if (selectedTags.length === 0) return placeholder;
    if (selectedTags.length === 1) return formatTagLabel(selectedTags[0]);
    return `${selectedTags.length} Tags`;
  };

  // Helper for keyboard navigation between fields
  const handleFieldNavigation = (e: React.KeyboardEvent, focusElement: HTMLElement | null) => {
    if (!isOpen && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      e.stopPropagation();
      const row = containerRef.current?.closest('[data-row-index]');
      if (!row) return;
      const focusableSelector = 'button, input, [tabindex]:not([tabindex="-1"])';
      const focusables = Array.from(row.querySelectorAll(focusableSelector)) as HTMLElement[];
      const currentIndex = focusables.indexOf(focusElement!);
      if (currentIndex === -1) return;
      const nextIndex = e.key === 'ArrowRight' 
        ? Math.min(currentIndex + 1, focusables.length - 1)
        : Math.max(currentIndex - 1, 0);
      if (nextIndex !== currentIndex) {
        focusables[nextIndex].focus();
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Pills display mode - compact pill with popover */}
      {displayMode === 'pills' ? (
        <div className="flex items-center gap-1 min-w-0 w-full">
          {/* Main pill trigger - shows "N Tags" or single tag code */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => {
              if (selectedTags.length > 1) {
                // Multiple tags - show the tags popover
                setShowTagsPopover(!showTagsPopover);
                setIsOpen(false);
              } else {
                // 0 or 1 tag - go directly to selection dropdown
                setIsOpen(!isOpen);
                setShowTagsPopover(false);
              }
            }}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !isOpen && !showTagsPopover) {
                e.preventDefault();
                if (selectedTags.length > 1) {
                  setShowTagsPopover(true);
                } else {
                  setIsOpen(true);
                }
                return;
              }
              if (e.key === 'Escape' && showTagsPopover) {
                e.preventDefault();
                setShowTagsPopover(false);
                return;
              }
              handleFieldNavigation(e, triggerRef.current);
            }}
            title={showTooltips && selectedTags.length === 1 ? fullTagLabel(selectedTags[0]) : undefined}
            className={`
              inline-flex items-center rounded-full transition-colors min-w-0 max-w-full overflow-hidden
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              ${selectedTags.length > 0 
                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-500'}
              ${compact ? 'px-2 py-0.5 text-[10px] min-w-[40px]' : 'px-2.5 py-1 text-xs min-w-[50px]'}
            `}
          >
            <span className="truncate">{getPillDisplayText()}</span>
            {selectedTags.length > 1 && (
              <svg className={`ml-1 ${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* Single tag dismiss button */}
          {selectedTags.length === 1 && (
            <button
              type="button"
              onClick={(e) => handleRemoveTag(selectedTags[0].id, e)}
              className={`
                p-0.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors
                focus:outline-none focus:ring-2 focus:ring-red-500
              `}
              tabIndex={-1}
              title="Remove tag"
            >
              <svg className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
              </svg>
            </button>
          )}

          {/* Add button - always visible */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              setShowTagsPopover(false);
            }}
            className={`
              rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${compact ? 'p-0.5' : 'p-1'}
            `}
            tabIndex={-1}
            title="Add tags"
          >
            <svg className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2v8M2 6h8" strokeLinecap="round" />
            </svg>
          </button>

          {/* Tags popover - shows selected tags with dismiss buttons */}
          {showTagsPopover && selectedTags.length > 1 && (
            <div className="absolute z-20 top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg ring-1 ring-black/10 min-w-[240px] max-w-[360px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium">Selected Tags</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange([]);
                    setShowTagsPopover(false);
                  }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    title={showTooltips ? fullTagLabel(tag) : undefined}
                    className={`
                      inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full w-full
                      ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}
                    `}
                  >
                    <span className="truncate flex-1 min-w-0">{formatTagLabel(tag)}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        handleRemoveTag(tag.id, e);
                        // Close popover if only 1 tag left
                        if (selectedTags.length <= 2) {
                          setShowTagsPopover(false);
                        }
                      }}
                      className="hover:bg-blue-200 rounded-full p-0.5 focus:outline-none transition-colors flex-shrink-0"
                      tabIndex={-1}
                    >
                      <svg className={`${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowTagsPopover(false);
                  setIsOpen(true);
                }}
                className="mt-2 w-full text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded py-1 transition-colors"
              >
                + Add more
              </button>
            </div>
          )}
        </div>
      ) : displayMode === 'pills-inline' ? (
        /* Inline pills display mode - pills inside input container */
        <div
          onClick={() => !isOpen && !showTagsPopover && selectedTags.length <= 1 && setIsOpen(true)}
          className={`
            flex items-center gap-1 rounded border border-gray-300 bg-white cursor-text w-full
            hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500
            ${compact ? 'px-1.5 py-0.5 min-h-[26px]' : 'px-2 py-1 min-h-[34px]'}
          `}
        >
          {/* Multiple tags - show "N Tags" pill with popover */}
          {selectedTags.length > 1 ? (
            <>
              <button
                ref={triggerRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTagsPopover(!showTagsPopover);
                  setIsOpen(false);
                }}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !showTagsPopover) {
                    e.preventDefault();
                    setShowTagsPopover(true);
                    return;
                  }
                  if (e.key === 'Escape' && showTagsPopover) {
                    e.preventDefault();
                    setShowTagsPopover(false);
                    return;
                  }
                  handleFieldNavigation(e, triggerRef.current);
                }}
                className={`
                  inline-flex items-center gap-0.5 bg-blue-100 text-blue-800 rounded-full
                  hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                  ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}
                `}
              >
                {selectedTags.length} Tags
                <svg className={`${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              
              {/* Tags popover for inline mode */}
              {showTagsPopover && (
                <div className="absolute z-20 top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg ring-1 ring-black/10 min-w-[240px] max-w-[360px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-medium">Selected Tags</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange([]);
                        setShowTagsPopover(false);
                      }}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag.id}
                        title={showTooltips ? fullTagLabel(tag) : undefined}
                        className={`
                          inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full w-full
                          ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}
                        `}
                      >
                        <span className="truncate flex-1 min-w-0">{formatTagLabel(tag)}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            handleRemoveTag(tag.id, e);
                            // Close popover if only 1 tag left
                            if (selectedTags.length <= 2) {
                              setShowTagsPopover(false);
                            }
                          }}
                          className="hover:bg-blue-200 rounded-full p-0.5 focus:outline-none transition-colors flex-shrink-0"
                          tabIndex={-1}
                        >
                          <svg className={`${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTagsPopover(false);
                      setIsOpen(true);
                    }}
                    className="mt-2 w-full text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded py-1 transition-colors"
                  >
                    + Add more
                  </button>
                </div>
              )}
            </>
          ) : selectedTags.length === 1 ? (
            /* Single tag - show pill with dismiss */
            <button
              ref={triggerRef}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isOpen) {
                  e.preventDefault();
                  setIsOpen(true);
                  return;
                }
                handleFieldNavigation(e, triggerRef.current);
              }}
              title={showTooltips ? fullTagLabel(selectedTags[0]) : undefined}
              className={`
                inline-flex items-center gap-0.5 bg-blue-100 text-blue-800 rounded-full text-left max-w-full overflow-hidden
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}
              `}
            >
              <span className="truncate min-w-0">{formatTagLabel(selectedTags[0])}</span>
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTag(selectedTags[0].id, e);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <svg className={`${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          ) : null}
          
          {/* Placeholder/trigger for empty state, or clickable area for single tag */}
          {selectedTags.length === 0 && (
            <button
              ref={triggerRef}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isOpen) {
                  e.preventDefault();
                  setIsOpen(true);
                  return;
                }
                handleFieldNavigation(e, triggerRef.current);
              }}
              className={`
                flex-1 min-w-[40px] text-left bg-transparent focus:outline-none text-gray-400
                ${compact ? 'text-xs' : 'text-sm'}
              `}
            >
              {placeholder}
            </button>
          )}
        </div>
      ) : (
        /* Text display mode - clean text display */
        <div className="relative flex items-center group/tag">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={(e) => {
              // Enter or Space opens the dropdown
              if ((e.key === 'Enter' || e.key === ' ') && !isOpen) {
                e.preventDefault();
                setIsOpen(true);
                return;
              }
              handleFieldNavigation(e, triggerRef.current);
            }}
            title={displayTooltip}
            className={`
              w-full text-left truncate rounded border border-gray-300 bg-white
              hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${compact ? 'px-2 py-1 text-xs' : 'px-2 py-1.5 text-sm'}
              ${selectedTags.length === 0 ? 'text-gray-400' : 'text-gray-900'}
              ${selectedTags.length > 0 ? (compact ? 'pr-6' : 'pr-7') : ''}
            `}
          >
            {displayText}
          </button>
          {/* Clear button for text mode */}
          {selectedTags.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              className={`
                absolute right-1 p-0.5 rounded text-gray-400 hover:text-gray-600 
                hover:bg-gray-100 transition-colors focus:outline-none
                ${compact ? 'right-1' : 'right-1.5'}
              `}
              tabIndex={-1}
              title="Clear"
            >
              <svg className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-20 mt-1 min-w-full w-max bg-white rounded-md shadow-lg ring-1 ring-black/5">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Options list */}
          <div ref={listRef} className="max-h-48 overflow-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No results</div>
            ) : (
              filteredOptions.map((tag, index) => {
                const isSelected = selectedIds.includes(tag.id);
                const isHighlighted = index === highlightedIndex;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    data-index={index}
                    onClick={() => handleToggle(tag.id)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 text-sm text-left
                      focus:outline-none
                      ${isHighlighted ? 'bg-gray-100' : ''}
                      ${isSelected ? 'text-blue-700' : 'text-gray-900'}
                      ${isSelected && !isHighlighted ? 'bg-blue-50' : ''}
                    `}
                  >
                    <span className={`
                      flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center
                      ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}
                    `}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className="flex-1 whitespace-nowrap">
                      <span className="font-medium">{tag.code}</span>
                      <span className="text-gray-500"> - {tag.name}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Clear selection */}
          {selectedIds.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  onChange([]);
                  setIsOpen(false);
                }}
                className="w-full px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

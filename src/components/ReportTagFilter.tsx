import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { tagCategories, getTagCategoriesWithLongNames, type TagCategory, type Tag } from '../data/mockData';

interface SelectedTag {
  categoryId: string;
  tagId: string;
}

interface ReportTagFilterProps {
  selectedTags: SelectedTag[];
  onChange: (tags: SelectedTag[]) => void;
  matchMode: 'any' | 'all';
  onMatchModeChange: (mode: 'any' | 'all') => void;
  longTagNames?: boolean;
}

export function ReportTagFilter({
  selectedTags,
  onChange,
  matchMode,
  onMatchModeChange,
  longTagNames = false,
}: ReportTagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Focus input when open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const activeTagCategories = useMemo(
    () => (longTagNames ? getTagCategoriesWithLongNames() : tagCategories),
    [longTagNames]
  );

  // All categories + "Untagged" virtual category
  const categories: (TagCategory | { id: string; name: string; tags: Tag[] })[] = [
    ...activeTagCategories,
    { id: 'untagged', name: 'Untagged', tags: [] },
  ];

  // Determine which category to show tags for
  const displayCategory = activeCategory ?? categories[0]?.id ?? null;

  // Get tags for the active category, filtered by query
  const activeCategoryData = categories.find((c) => c.id === displayCategory);
  const activeTags = activeCategoryData?.tags ?? [];
  const filteredTags =
    query === ''
      ? activeTags
      : activeTags.filter(
          (tag) =>
            tag.name.toLowerCase().includes(query.toLowerCase()) ||
            tag.code.toLowerCase().includes(query.toLowerCase())
        );

  // Also filter across ALL categories when there's a query
  const allFilteredTags: { category: string; tag: Tag }[] = [];
  if (query !== '') {
    for (const cat of activeTagCategories) {
      for (const tag of cat.tags) {
        if (
          tag.name.toLowerCase().includes(query.toLowerCase()) ||
          tag.code.toLowerCase().includes(query.toLowerCase())
        ) {
          allFilteredTags.push({ category: cat.id, tag });
        }
      }
    }
  }

  const isTagSelected = useCallback(
    (categoryId: string, tagId: string) =>
      selectedTags.some((t) => t.categoryId === categoryId && t.tagId === tagId),
    [selectedTags]
  );

  const handleToggleTag = (categoryId: string, tagId: string) => {
    if (isTagSelected(categoryId, tagId)) {
      onChange(selectedTags.filter((t) => !(t.categoryId === categoryId && t.tagId === tagId)));
    } else {
      onChange([...selectedTags, { categoryId, tagId }]);
    }
  };

  const handleRemoveTag = (categoryId: string, tagId: string) => {
    onChange(selectedTags.filter((t) => !(t.categoryId === categoryId && t.tagId === tagId)));
  };

  const handleSelectAll = () => {
    if (!activeCategoryData) return;
    const allInCategory = activeCategoryData.tags.map((t) => ({
      categoryId: activeCategoryData.id,
      tagId: t.id,
    }));
    // Check if all are already selected
    const allSelected = allInCategory.every((t) => isTagSelected(t.categoryId, t.tagId));
    if (allSelected) {
      // Deselect all in this category
      onChange(
        selectedTags.filter(
          (t) => !allInCategory.some((a) => a.categoryId === t.categoryId && a.tagId === t.tagId)
        )
      );
    } else {
      // Select all in this category (add missing ones)
      const toAdd = allInCategory.filter((a) => !isTagSelected(a.categoryId, a.tagId));
      onChange([...selectedTags, ...toAdd]);
    }
  };

  // Resolve selected tag objects for display
  const resolvedSelected = selectedTags
    .map((st) => {
      const cat = activeTagCategories.find((c) => c.id === st.categoryId);
      const tag = cat?.tags.find((t) => t.id === st.tagId);
      return tag ? { ...st, tag } : null;
    })
    .filter(Boolean) as (SelectedTag & { tag: Tag })[];

  const handleApply = () => {
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger — closed: button, open: typeable input with pills */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 whitespace-nowrap w-full"
        >
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {resolvedSelected.length === 0
            ? 'Filter by tags'
            : `${resolvedSelected.length} tag${resolvedSelected.length !== 1 ? 's' : ''} selected`}
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : (
        <div
          className="flex items-center gap-1.5 flex-wrap px-3 py-2 text-sm border border-blue-500 ring-2 ring-blue-200 rounded-md bg-white w-full cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={resolvedSelected.length === 0 ? 'Search tags...' : ''}
            size={query.length > 0 ? query.length + 1 : resolvedSelected.length === 0 ? 20 : 1}
            className="text-sm bg-transparent outline-none placeholder-gray-400 min-w-[20px]"
          />
          {resolvedSelected.map((st) => (
            <span
              key={`${st.categoryId}-${st.tagId}`}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs"
            >
              {st.tag.code} - {st.tag.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTag(st.categoryId, st.tagId);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
                </svg>
              </button>
            </span>
          ))}
          <svg
            className="w-4 h-4 text-gray-400 flex-shrink-0 ml-auto rotate-180 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); setQuery(''); }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-30 mt-1 left-0 right-0 bg-white rounded-lg shadow-xl ring-1 ring-black/10 overflow-hidden min-w-[480px]">

          {/* Contains any / Contains all toggle */}
          <div className="flex justify-end px-4 pb-2">
            <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => onMatchModeChange('any')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  matchMode === 'any'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Contains any
              </button>
              <button
                type="button"
                onClick={() => onMatchModeChange('all')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-gray-200 ${
                  matchMode === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Contains all
              </button>
            </div>
          </div>

          {/* Two-column layout: categories sidebar + tag list */}
          <div className="flex border-t border-gray-100" style={{ minHeight: '280px' }}>
            {/* Category sidebar */}
            <div className="w-40 border-r border-gray-100 bg-gray-50/50 py-1">
              {categories.map((cat) => {
                const isActive = cat.id === displayCategory;
                const catSelectedCount = selectedTags.filter((t) => t.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`
                      w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between
                      ${isActive ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}
                    `}
                  >
                    <span>
                      {cat.name}
                      {cat.id === 'events' && <span className="text-red-500 ml-0.5">*</span>}
                    </span>
                    {catSelectedCount > 0 && (
                      <span className="bg-blue-100 text-blue-700 text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {catSelectedCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tag list */}
            <div className="flex-1 overflow-auto">
              {/* Select All row */}
              {activeCategoryData && activeCategoryData.tags.length > 0 && !query && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left border-b border-gray-100 hover:bg-gray-50"
                >
                  <span
                    className={`
                      flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                      ${
                        activeCategoryData.tags.every((t) => isTagSelected(activeCategoryData.id, t.id))
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }
                    `}
                  >
                    {activeCategoryData.tags.every((t) => isTagSelected(activeCategoryData.id, t.id)) && (
                      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="font-medium text-gray-700">Select all</span>
                </button>
              )}

              {/* Category heading when showing filtered results */}
              {query && allFilteredTags.length > 0 ? (
                <div className="py-1">
                  <div className="px-4 py-2 text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    All Tags
                  </div>
                  {allFilteredTags.map(({ category, tag }) => {
                    const selected = isTagSelected(category, tag.id);
                    return (
                      <button
                        key={`${category}-${tag.id}`}
                        type="button"
                        onClick={() => handleToggleTag(category, tag.id)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                          ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                        `}
                      >
                        <span
                          className={`
                            flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                            ${selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}
                          `}
                        >
                          {selected && (
                            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 12" fill="none">
                              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className={selected ? 'text-blue-700 font-medium' : 'text-gray-900'}>
                          {tag.code} - {tag.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : query && allFilteredTags.length === 0 ? (
                <div className="px-4 py-8 text-sm text-gray-500 text-center">No matching tags</div>
              ) : (
                /* Normal category tag list */
                <div className="py-1">
                  {/* Group heading */}
                  <div className="px-4 py-2 text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    All Tags
                  </div>

                  {filteredTags.map((tag) => {
                    const selected = isTagSelected(displayCategory!, tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleToggleTag(displayCategory!, tag.id)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                          ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                        `}
                      >
                        <span
                          className={`
                            flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                            ${selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}
                          `}
                        >
                          {selected && (
                            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 12" fill="none">
                              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className={selected ? 'text-blue-700 font-medium' : 'text-gray-900'}>
                          {tag.code} - {tag.name}
                        </span>
                      </button>
                    );
                  })}

                  {/* Show additional tag groups within this category if we want to mimic the screenshot's "Tag Group 2" */}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <span className="text-sm text-gray-500 mr-auto">
              {selectedTags.length} selected
            </span>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 bg-blue-700 text-white text-sm font-medium rounded-md hover:bg-blue-800 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

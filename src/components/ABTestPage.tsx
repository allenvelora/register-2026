import { useMemo } from 'react';
import { TransactionForm } from './TransactionForm';
import type { ControlPanelState } from '../hooks/useControlPanel';

export type ViewTab = 'tag-details' | 'option-a' | 'option-b';

const VIEW_TABS: { id: ViewTab; label: string; subtitle?: string; task?: string }[] = [
  {
    id: 'tag-details',
    label: 'Tag Details',
    subtitle: 'Default view with tag detail rows expanded.',
  },
  {
    id: 'option-a',
    label: 'Option A: Expanded',
    subtitle: 'All tag columns visible with full-length names.',
    task: 'Review the 5 programs for the Petty Cash line.',
  },
  {
    id: 'option-b',
    label: 'Option B: Compact + Hover',
    subtitle: 'Fewer columns with hover-for-detail tooltips.',
    task: 'Scan the list and hover to find the specific "Art for Youth" sub-program.',
  },
];

const TAG_COLUMN_ORDER = ['programs', 'events', 'departments', 'custom', '990'] as const;

function getVisibleTagColumns(count: number): string[] {
  return TAG_COLUMN_ORDER.slice(0, count);
}

const baseSettings: ControlPanelState = {
  activePage: 'transactions',
  tagColumnCount: 3,
  footerLayout: 'default',
  compactMode: false,
  tagDisplayMode: 'text',
  tagNameDisplay: 'truncate-tooltip',
  longTagNames: false,
  showTagTooltips: true,
};

const viewOverrides: Record<ViewTab, Partial<ControlPanelState>> = {
  'tag-details': {
    tagColumnCount: 3,
    showTagTooltips: true,
  },
  'option-a': {
    tagColumnCount: 5,
    longTagNames: true,
    showTagTooltips: false,
  },
  'option-b': {
    tagColumnCount: 2,
    longTagNames: false,
    showTagTooltips: true,
  },
};

interface ABTestPageProps {
  activeTab: ViewTab;
}

export function ABTestPage({ activeTab }: ABTestPageProps) {
  const controlState = useMemo<ControlPanelState>(
    () => ({ ...baseSettings, ...viewOverrides[activeTab] }),
    [activeTab]
  );

  const visibleTagColumns = useMemo(
    () => getVisibleTagColumns(controlState.tagColumnCount),
    [controlState.tagColumnCount]
  );

  const activeTabInfo = VIEW_TABS.find((t) => t.id === activeTab)!;

  const handleTabChange = (tab: ViewTab) => {
    window.location.hash = tab === 'tag-details' ? '/' : `/${tab}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="flex items-center gap-1 px-6">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                py-3 px-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task instruction banner */}
      {activeTabInfo.task && (
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              <strong>Task:</strong> {activeTabInfo.task}
            </span>
          </div>
        </div>
      )}

      {/* Subtitle / context bar */}
      {activeTabInfo.subtitle && !activeTabInfo.task && (
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-2">
          <p className="text-xs text-gray-500">{activeTabInfo.subtitle}</p>
        </div>
      )}

      {/* Main content */}
      <div className="p-6">
        <TransactionForm
          key={activeTab}
          controlState={controlState}
          visibleTagColumns={visibleTagColumns}
          defaultShowTagDetails={true}
        />
      </div>

      {/* Subtle archive link */}
      <div className="fixed bottom-3 right-3">
        <a
          href="#/archive"
          className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors"
          title="Design exploration archive"
        >
          Design Archive
        </a>
      </div>
    </div>
  );
}

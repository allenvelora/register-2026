import { useState, useEffect } from 'react';
import { useControlPanel } from './hooks/useControlPanel';
import { ControlPanel } from './components/ControlPanel';
import { TransactionForm } from './components/TransactionForm';
import { ReportsPage } from './components/ReportsPage';
import { ABTestPage } from './components/ABTestPage';
import type { ViewTab } from './components/ABTestPage';

type Route = 'test' | 'archive';

interface RouteInfo {
  route: Route;
  tab: ViewTab;
}

function getRouteFromHash(): RouteInfo {
  const hash = window.location.hash.replace('#', '').replace(/^\//, '');
  if (hash === 'archive') return { route: 'archive', tab: 'tag-details' };
  if (hash === 'option-a') return { route: 'test', tab: 'option-a' };
  if (hash === 'option-b') return { route: 'test', tab: 'option-b' };
  return { route: 'test', tab: 'tag-details' };
}

function App() {
  const [routeInfo, setRouteInfo] = useState<RouteInfo>(getRouteFromHash);

  useEffect(() => {
    const handleHashChange = () => setRouteInfo(getRouteFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (routeInfo.route === 'archive') {
    return <ArchivePage />;
  }

  return <ABTestPage activeTab={routeInfo.tab} />;
}

function ArchivePage() {
  const {
    state,
    updateState,
    resetToDefaults,
    isMinimized,
    toggleMinimized,
    visibleTagColumns,
  } = useControlPanel();

  const tabs: { id: typeof state.activePage; label: string }[] = [
    { id: 'transactions', label: 'Register/Logging Transaction' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <div className={`min-h-screen bg-white ${state.compactMode ? 'compact' : ''}`}>
      {/* Archive banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <span className="font-medium">Archive</span>
            <span className="text-amber-600">— Design exploration with full controls</span>
          </div>
          <a
            href="#/"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            &larr; Back to Test Page
          </a>
        </div>
      </div>

      {/* Top nav tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="flex items-center gap-6 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => updateState('activePage', tab.id)}
              className={`
                py-3 text-sm font-medium border-b-2 transition-colors
                ${state.activePage === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        {state.activePage === 'transactions' ? (
          <TransactionForm
            controlState={state}
            visibleTagColumns={visibleTagColumns}
          />
        ) : (
          <ReportsPage longTagNames={state.longTagNames} />
        )}
      </div>

      {/* Floating control panel */}
      <ControlPanel
        state={state}
        updateState={updateState}
        resetToDefaults={resetToDefaults}
        isMinimized={isMinimized}
        toggleMinimized={toggleMinimized}
      />
    </div>
  );
}

export default App;

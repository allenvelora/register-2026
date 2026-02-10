import { useControlPanel } from './hooks/useControlPanel';
import { ControlPanel } from './components/ControlPanel';
import { TransactionForm } from './components/TransactionForm';
import { ReportsPage } from './components/ReportsPage';

function App() {
  const {
    state,
    updateState,
    resetToDefaults,
    isMinimized,
    toggleMinimized,
    visibleTagColumns,
    containerWidthPx,
  } = useControlPanel();

  const tabs: { id: typeof state.activePage; label: string }[] = [
    { id: 'transactions', label: 'Register/Logging Transaction' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <div className={`min-h-screen bg-white ${state.compactMode ? 'compact' : ''}`}>
      {/* Top nav tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div
          className="mx-auto flex items-center gap-6 px-6 transition-all duration-300"
          style={{ maxWidth: containerWidthPx }}
        >
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

      {/* Main content with configurable width */}
      <div
        className="mx-auto p-6 transition-all duration-300"
        style={{ maxWidth: containerWidthPx }}
      >
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

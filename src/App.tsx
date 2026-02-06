import { useControlPanel } from './hooks/useControlPanel';
import { ControlPanel } from './components/ControlPanel';
import { TransactionForm } from './components/TransactionForm';

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

  return (
    <div className={`min-h-screen bg-white p-6 ${state.compactMode ? 'compact' : ''}`}>
      {/* Main content with configurable width */}
      <div
        className="mx-auto transition-all duration-300"
        style={{ maxWidth: containerWidthPx }}
      >
        <TransactionForm
          controlState={state}
          visibleTagColumns={visibleTagColumns}
        />
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

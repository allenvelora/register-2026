import { useState } from 'react';
import { DistributionTable } from './DistributionTable';
import { SelectField } from './SelectField';
import { CurrencyInput } from './CurrencyInput';
import {
  contacts,
  sampleTransaction,
  formatCurrency,
  createEmptySplit,
  type Transaction,
  type Split,
} from '../data/mockData';
import type { ControlPanelState } from '../hooks/useControlPanel';

interface TransactionFormProps {
  controlState: ControlPanelState;
  visibleTagColumns: string[];
}

export function TransactionForm({ controlState, visibleTagColumns }: TransactionFormProps) {
  const [transaction, setTransaction] = useState<Transaction>(sampleTransaction);
  const [showLineDescription, setShowLineDescription] = useState(false);
  const [showTagDetails, setShowTagDetails] = useState(false);

  const handleFieldChange = <K extends keyof Transaction>(field: K, value: Transaction[K]) => {
    setTransaction((t) => ({ ...t, [field]: value }));
  };

  const handleSplitsChange = (splits: Split[]) => {
    setTransaction((t) => ({ ...t, splits }));
  };

  const handleAddSplit = () => {
    const newSplit = createEmptySplit(transaction.amount, transaction.splits);
    setTransaction((t) => ({ ...t, splits: [...t.splits, newSplit] }));
  };

  const contactOptions = contacts.map((c) => ({
    id: c.id,
    label: c.name,
  }));

  const compact = controlState.compactMode;
  const consolidatedFooter = controlState.footerLayout === 'consolidated';
  
  // Calculate remaining balance for consolidated footer
  const allocatedAmount = transaction.splits.reduce((sum, s) => sum + s.amount, 0);
  const remainingBalance = transaction.amount - allocatedAmount;
  const labelClass = compact ? 'text-xs' : 'text-sm';
  const fieldSpacing = compact ? 'space-y-1' : 'space-y-1.5';

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${compact ? 'p-3' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className={`font-semibold text-gray-900 ${compact ? 'text-base' : 'text-lg'}`}>
            Edit Transaction Detail
          </h2>
          <span
            className={`
              inline-flex items-center rounded-full font-medium bg-gray-100 text-gray-600
              ${compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}
            `}
          >
            {transaction.type === 'payment' ? 'Payment' : 'Deposit'}
          </span>
        </div>
        <div className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
          Register: <span className="font-medium text-gray-700">1000 - Checking</span>
        </div>
      </div>

      {/* Form fields row */}
      <div className={`grid grid-cols-5 gap-3 mb-4 ${compact ? 'gap-2' : 'gap-3'}`}>
        {/* Check # */}
        <div className={fieldSpacing}>
          <label className={`block font-medium text-gray-700 ${labelClass}`}>Check #</label>
          <input
            type="text"
            value={transaction.checkNumber}
            onChange={(e) => handleFieldChange('checkNumber', e.target.value)}
            className={`
              w-full rounded border border-gray-300 bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${compact ? 'px-2 py-1 text-xs' : 'px-2 py-1.5 text-sm'}
            `}
          />
        </div>

        {/* Date */}
        <div className={fieldSpacing}>
          <label className={`block font-medium text-gray-700 ${labelClass}`}>
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={transaction.date}
            onChange={(e) => handleFieldChange('date', e.target.value)}
            className={`
              w-full rounded border border-gray-300 bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${compact ? 'px-2 py-1 text-xs' : 'px-2 py-1.5 text-sm'}
            `}
          />
        </div>

        {/* Contact */}
        <div className={`${fieldSpacing} col-span-2`}>
          <label className={`block font-medium text-gray-700 ${labelClass}`}>
            Contact <span className="text-red-500">*</span>
          </label>
          <SelectField
            value={transaction.contactId}
            options={contactOptions}
            onChange={(v) => {
              const contact = contacts.find((c) => c.id === v);
              handleFieldChange('contactId', v);
              if (contact) {
                handleFieldChange('contactName', contact.name);
              }
            }}
            placeholder="Type to search"
            compact={compact}
          />
        </div>

        {/* Amount */}
        <div className={fieldSpacing}>
          <label className={`block font-medium text-gray-700 ${labelClass}`}>Amount</label>
          <CurrencyInput
            value={transaction.amount}
            onChange={(v) => handleFieldChange('amount', v)}
            compact={compact}
          />
        </div>
      </div>

      {/* Memo */}
      <div className={`mb-4 ${fieldSpacing}`}>
        <label className={`block font-medium text-gray-700 ${labelClass}`}>Memo</label>
        <input
          type="text"
          value={transaction.memo}
          onChange={(e) => handleFieldChange('memo', e.target.value)}
          className={`
            w-full rounded border border-gray-300 bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${compact ? 'px-2 py-1 text-xs' : 'px-2 py-1.5 text-sm'}
          `}
        />
      </div>

      {/* Distribution section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-medium text-gray-700 ${labelClass}`}>Distribution</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
                Tag details
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showTagDetails}
                  onChange={(e) => setShowTagDetails(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-[18px] bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[14px] after:w-[14px] after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
                Line description
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showLineDescription}
                  onChange={(e) => setShowLineDescription(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-[18px] bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[14px] after:w-[14px] after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>
          </div>
        </div>

        <DistributionTable
          splits={transaction.splits}
          onChange={handleSplitsChange}
          totalAmount={transaction.amount}
          visibleTagColumns={visibleTagColumns}
          showLineDescription={showLineDescription}
          compact={compact}
          tagDisplayMode={controlState.tagDisplayMode}
          tagNameDisplay={controlState.tagNameDisplay}
          longTagNames={controlState.longTagNames}
          showTagDetails={showTagDetails}
          hideFooter={consolidatedFooter}
          onAddSplit={handleAddSplit}
        />
      </div>

      {/* Footer buttons */}
      <div className={`flex items-center pt-3 border-t border-gray-200 ${consolidatedFooter ? 'justify-between' : 'justify-end'}`}>
        {/* Left side - Add split (only in consolidated mode) */}
        {consolidatedFooter && (
          <button
            onClick={handleAddSplit}
            className={`
              inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium
              border border-blue-200 rounded px-3 py-1.5 hover:bg-blue-50 transition-colors
              ${compact ? 'text-xs' : 'text-sm'}
            `}
          >
            <PlusIcon className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
            {transaction.splits.length === 1 ? 'Create split' : 'Add split'}
          </button>
        )}

        {/* Right side - Balance + Actions */}
        <div className="flex items-center gap-3">
          {/* Remaining balance (only in consolidated mode) */}
          {consolidatedFooter && (
            <div className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
              Remaining:{' '}
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
          )}

          <button
            className={`
              px-4 py-2 font-medium rounded transition-colors
              ${consolidatedFooter 
                ? 'text-gray-600 hover:text-gray-800 border border-gray-300 hover:bg-gray-50' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}
              ${compact ? 'text-xs px-3 py-1.5' : 'text-sm'}
            `}
          >
            Cancel
          </button>
          <button
            className={`
              px-4 py-2 font-medium rounded transition-colors
              border border-blue-600 text-blue-600 hover:bg-blue-50
              ${compact ? 'text-xs px-3 py-1.5' : 'text-sm'}
            `}
          >
            Save & Add New
          </button>
          <button
            className={`
              px-4 py-2 bg-blue-600 text-white font-medium rounded
              hover:bg-blue-700 transition-colors
              ${compact ? 'text-xs px-3 py-1.5' : 'text-sm'}
            `}
          >
            Save
          </button>
        </div>
      </div>
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

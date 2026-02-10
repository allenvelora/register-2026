import { useState } from 'react';
import { ReportTagFilter } from './ReportTagFilter';

interface SelectedTag {
  categoryId: string;
  tagId: string;
}

// Placeholder report data mimicking a Budget vs Actual report
const reportData = {
  income: [
    { code: '4010', name: 'Contributions', currentActual: 1000, currentBudget: 2000, ytdActual: 13000, ytdBudget: 10000 },
    { code: '4430', name: 'Fundraising', currentActual: 1000, currentBudget: 1000, ytdActual: 12000, ytdBudget: 10000 },
  ],
  expenses: [
    { code: '5050', name: 'Accounting fees', currentActual: -45, currentBudget: -50, ytdActual: -450, ytdBudget: -500 },
    { code: '5055', name: 'Legal fees', currentActual: -500, currentBudget: -500, ytdActual: -5600, ytdBudget: -5000 },
    { code: '5075', name: 'Professional fees - other', currentActual: -50, currentBudget: -50, ytdActual: -500, ytdBudget: -500 },
    { code: '5245', name: 'Equipment rental & maintenance', currentActual: -50, currentBudget: -40, ytdActual: -500, ytdBudget: -500 },
    { code: '5415', name: 'Office expenses', currentActual: -750, currentBudget: -500, ytdActual: -7500, ytdBudget: -5000 },
  ],
};

function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(amount));
  return isNegative ? `-${formatted}` : formatted;
}

function sumField(items: typeof reportData.income, field: 'currentActual' | 'currentBudget' | 'ytdActual' | 'ytdBudget') {
  return items.reduce((sum, r) => sum + r[field], 0);
}

interface ReportsPageProps {
  longTagNames?: boolean;
}

export function ReportsPage({ longTagNames = false }: ReportsPageProps) {
  const [selectedTags, setSelectedTags] = useState<SelectedTag[]>([]);
  const [matchMode, setMatchMode] = useState<'any' | 'all'>('any');
  const [dateRange] = useState('This month to date');
  const [accountingMethod] = useState('Accrual');

  const totalIncomeCurrentActual = sumField(reportData.income, 'currentActual');
  const totalIncomeCurrentBudget = sumField(reportData.income, 'currentBudget');
  const totalIncomeYtdActual = sumField(reportData.income, 'ytdActual');
  const totalIncomeYtdBudget = sumField(reportData.income, 'ytdBudget');

  const totalExpenseCurrentActual = sumField(reportData.expenses, 'currentActual');
  const totalExpenseCurrentBudget = sumField(reportData.expenses, 'currentBudget');
  const totalExpenseYtdActual = sumField(reportData.expenses, 'ytdActual');
  const totalExpenseYtdBudget = sumField(reportData.expenses, 'ytdBudget');

  const netCurrentActual = totalIncomeCurrentActual + totalExpenseCurrentActual;
  const netCurrentBudget = totalIncomeCurrentBudget + totalExpenseCurrentBudget;
  const netYtdActual = totalIncomeYtdActual + totalExpenseYtdActual;
  const netYtdBudget = totalIncomeYtdBudget + totalExpenseYtdBudget;

  return (
    <div className="bg-white">
      {/* Report header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500">Back to reports</p>
          <h1 className="text-xl font-bold text-gray-900">Budget to Actual</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded border border-gray-200">
            Share
          </button>
          <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded border border-gray-200">
            Export
          </button>
          <button className="px-3 py-1.5 text-sm text-white bg-blue-700 rounded hover:bg-blue-800 font-medium">
            Save Report
          </button>
        </div>
      </div>

      {/* Filter section with light blue background */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 space-y-3 mb-6">
        {/* First filter row */}
        <div className="flex items-center gap-3">
          {/* Date range dropdown */}
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 whitespace-nowrap">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {dateRange}
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Accounting method */}
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 whitespace-nowrap">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
            </svg>
            {accountingMethod}
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className="flex-1" />

          {/* Customize button */}
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 whitespace-nowrap">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Customize
          </button>
        </div>

        {/* Second filter row: accounts, funds, tags */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 whitespace-nowrap min-w-[180px]">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18m-9 5h9" />
            </svg>
            Filter by accounts
            <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 whitespace-nowrap min-w-[180px]">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18m-9 5h9" />
            </svg>
            Filter by funds
            <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Unified tag filter */}
          <div className="flex-1 relative">
            <ReportTagFilter
              selectedTags={selectedTags}
              onChange={setSelectedTags}
              matchMode={matchMode}
              onMatchModeChange={setMatchMode}
              longTagNames={longTagNames}
            />
          </div>
        </div>
      </div>

      {/* Report content */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Report title area */}
        <div className="text-center py-6 border-b border-gray-200 bg-white">
          <p className="text-sm text-gray-500">Aplos</p>
          <h2 className="text-lg font-bold text-gray-900 mt-1">
            Budget vs Actual
          </h2>
          <p className="text-xs text-gray-500 mt-1">Period of: 02/01/2026 to 02/06/2026</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Column headers */}
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-24">Account Number</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-48">Account Name</th>
                <th colSpan={3} className="text-center px-4 py-2 font-semibold text-gray-700 border-l border-gray-200">
                  <div className="text-xs text-blue-600 mb-1">Current Period (02/01/2026 to 02/06/2026)</div>
                </th>
                <th colSpan={3} className="text-center px-4 py-2 font-semibold text-gray-700 border-l border-gray-200">
                  <div className="text-xs text-blue-600 mb-1">YTD (01/01/2026 to 02/06/2026)</div>
                </th>
              </tr>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2" />
                <th className="px-4 py-2" />
                <th className="text-right px-4 py-2 font-medium text-gray-600 text-xs border-l border-gray-200">Actual</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600 text-xs">Budget</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600 text-xs">Variance $</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600 text-xs border-l border-gray-200">Actual</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600 text-xs">Budget</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600 text-xs">Variance $</th>
              </tr>
            </thead>
            <tbody>
              {/* Income section */}
              <tr>
                <td colSpan={8} className="px-4 pt-4 pb-1">
                  <span className="font-bold text-gray-800">Income</span>
                </td>
              </tr>
              {reportData.income.map((row) => (
                <tr key={row.code} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-600 pl-8">{row.code}</td>
                  <td className="px-4 py-2 text-gray-800">{row.name}</td>
                  <td className="px-4 py-2 text-right text-gray-700 border-l border-gray-100">{formatCurrency(row.currentActual)}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{formatCurrency(row.currentBudget)}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{formatCurrency(row.currentActual - row.currentBudget)}</td>
                  <td className="px-4 py-2 text-right text-gray-700 border-l border-gray-100">{formatCurrency(row.ytdActual)}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{formatCurrency(row.ytdBudget)}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{formatCurrency(row.ytdActual - row.ytdBudget)}</td>
                </tr>
              ))}
              {/* Total Income */}
              <tr className="bg-green-50/50 border-b border-gray-200">
                <td className="px-4 py-2 pl-8" />
                <td className="px-4 py-2 font-semibold text-green-700">Total Income</td>
                <td className="px-4 py-2 text-right font-bold text-green-700 border-l border-gray-100">{formatCurrency(totalIncomeCurrentActual)}</td>
                <td className="px-4 py-2 text-right font-bold text-green-700">{formatCurrency(totalIncomeCurrentBudget)}</td>
                <td className="px-4 py-2 text-right font-bold text-green-700">{formatCurrency(totalIncomeCurrentActual - totalIncomeCurrentBudget)}</td>
                <td className="px-4 py-2 text-right font-bold text-green-700 border-l border-gray-100">{formatCurrency(totalIncomeYtdActual)}</td>
                <td className="px-4 py-2 text-right font-bold text-green-700">{formatCurrency(totalIncomeYtdBudget)}</td>
                <td className="px-4 py-2 text-right font-bold text-green-700">{formatCurrency(totalIncomeYtdActual - totalIncomeYtdBudget)}</td>
              </tr>

              {/* Spacer */}
              <tr><td colSpan={8} className="py-2" /></tr>

              {/* Expense section */}
              <tr>
                <td colSpan={8} className="px-4 pb-1">
                  <span className="font-bold text-gray-800">Expense</span>
                </td>
              </tr>
              {reportData.expenses.map((row) => (
                <tr key={row.code} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-600 pl-8">{row.code}</td>
                  <td className="px-4 py-2 text-gray-800">{row.name}</td>
                  <td className="px-4 py-2 text-right text-gray-700 border-l border-gray-100">{formatCurrency(row.currentActual)}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{formatCurrency(row.currentBudget)}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{formatCurrency(row.currentActual - row.currentBudget)}</td>
                  <td className="px-4 py-2 text-right text-gray-700 border-l border-gray-100">{formatCurrency(row.ytdActual)}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{formatCurrency(row.ytdBudget)}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{formatCurrency(row.ytdActual - row.ytdBudget)}</td>
                </tr>
              ))}
              {/* Total Expense */}
              <tr className="bg-red-50/50 border-b border-gray-200">
                <td className="px-4 py-2 pl-8" />
                <td className="px-4 py-2 font-semibold text-red-700">Total Expense</td>
                <td className="px-4 py-2 text-right font-bold text-red-700 border-l border-gray-100">{formatCurrency(totalExpenseCurrentActual)}</td>
                <td className="px-4 py-2 text-right font-bold text-red-700">{formatCurrency(totalExpenseCurrentBudget)}</td>
                <td className="px-4 py-2 text-right font-bold text-red-700">{formatCurrency(totalExpenseCurrentActual - totalExpenseCurrentBudget)}</td>
                <td className="px-4 py-2 text-right font-bold text-red-700 border-l border-gray-100">{formatCurrency(totalExpenseYtdActual)}</td>
                <td className="px-4 py-2 text-right font-bold text-red-700">{formatCurrency(totalExpenseYtdBudget)}</td>
                <td className="px-4 py-2 text-right font-bold text-red-700">{formatCurrency(totalExpenseYtdActual - totalExpenseYtdBudget)}</td>
              </tr>

              {/* Spacer */}
              <tr><td colSpan={8} className="py-1" /></tr>

              {/* Net Total */}
              <tr className="bg-gray-100 border-t-2 border-gray-300">
                <td className="px-4 py-3 pl-8" />
                <td className="px-4 py-3 font-bold text-gray-900">Total Income</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 border-l border-gray-200">{formatCurrency(netCurrentActual)}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(netCurrentBudget)}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(netCurrentActual - netCurrentBudget)}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 border-l border-gray-200">{formatCurrency(netYtdActual)}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(netYtdBudget)}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(netYtdActual - netYtdBudget)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

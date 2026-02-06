// Types
export interface Account {
  id: string;
  code: string;
  name: string;
}

export interface Fund {
  id: string;
  code: string;
  name: string;
}

export interface Tag {
  id: string;
  code: string;
  name: string;
}

export interface TagCategory {
  id: string;
  name: string;
  tags: Tag[];
}

export interface Split {
  id: string;
  accountId: string;
  fundId: string;
  programIds: string[];
  eventIds: string[];
  departmentIds: string[];
  customIds: string[];
  nineNinetyIds: string[];
  percentage: number;
  amount: number;
  lineDescription: string;
}

export interface Transaction {
  id: string;
  checkNumber: string;
  date: string;
  contactId: string;
  contactName: string;
  amount: number;
  memo: string;
  type: 'payment' | 'deposit';
  splits: Split[];
}

export interface Contact {
  id: string;
  name: string;
}

// Mock Data
export const accounts: Account[] = [
  { id: '1', code: '1000', name: 'Checking' },
  { id: '2', code: '1001', name: 'Saving' },
  { id: '3', code: '1002', name: 'Petty Cash' },
  { id: '4', code: '1100', name: 'Accounts Receivable' },
  { id: '5', code: '2000', name: 'Accounts Payable' },
  { id: '6', code: '4000', name: 'Contributions' },
  { id: '7', code: '5000', name: 'Program Expenses' },
  { id: '8', code: '5100', name: 'Administrative' },
];

export const funds: Fund[] = [
  { id: '1', code: '100', name: 'General Fund' },
  { id: '2', code: '200', name: 'Building Fund' },
  { id: '3', code: '300', name: 'Missions Fund' },
  { id: '4', code: '400', name: 'Youth Fund' },
  { id: '5', code: '500', name: 'Music Ministry' },
  { id: '6', code: '600', name: 'Benevolence' },
];

export const tagCategories: TagCategory[] = [
  {
    id: 'programs',
    name: 'Programs',
    tags: [
      { id: 'p1', code: '101', name: 'Art for Youth' },
      { id: 'p2', code: '102', name: 'Community Project' },
      { id: 'p3', code: '103', name: 'City Hall' },
      { id: 'p4', code: '104', name: 'Music Therapy' },
      { id: 'p5', code: '105', name: 'After School' },
    ],
  },
  {
    id: 'events',
    name: 'Events',
    tags: [
      { id: 'e1', code: '201', name: 'Annual Gala' },
      { id: 'e2', code: '202', name: 'Summer Camp' },
      { id: 'e3', code: '203', name: 'Christmas Concert' },
      { id: 'e4', code: '204', name: 'Fall Festival' },
      { id: 'e5', code: '205', name: 'Board Retreat' },
    ],
  },
  {
    id: 'departments',
    name: 'Departments',
    tags: [
      { id: 'd1', code: '301', name: 'Administration' },
      { id: 'd2', code: '302', name: 'Finance' },
      { id: 'd3', code: '303', name: 'Operations' },
      { id: 'd4', code: '304', name: 'Outreach' },
      { id: 'd5', code: '305', name: 'Development' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    tags: [
      { id: 'c1', code: '401', name: 'Grant A' },
      { id: 'c2', code: '402', name: 'Grant B' },
      { id: 'c3', code: '403', name: 'Restricted' },
      { id: 'c4', code: '404', name: 'Unrestricted' },
      { id: 'c5', code: '405', name: 'Capital' },
    ],
  },
  {
    id: '990',
    name: '990',
    tags: [
      { id: 'n1', code: '501', name: 'Program Services' },
      { id: 'n2', code: '502', name: 'Management' },
      { id: 'n3', code: '503', name: 'Fundraising' },
      { id: 'n4', code: '504', name: 'Unrelated Business' },
    ],
  },
];

export const contacts: Contact[] = [
  { id: '1', name: 'Charlie Cheddar' },
  { id: '2', name: 'Ricky Ricotta' },
  { id: '3', name: 'Penny Parmesan' },
  { id: '4', name: 'Becky Brie' },
  { id: '5', name: 'Melissa Mozerella' },
  { id: '6', name: 'Marlie Maasdam' },
  { id: '7', name: 'Camilla Cottage' },
  { id: '8', name: 'Rahul Raclette' },
  { id: '9', name: 'Felipe Feta' },
];

// Sample transaction for the editor
export const sampleTransaction: Transaction = {
  id: 'txn-1',
  checkNumber: '202',
  date: '2026-02-04',
  contactId: '4',
  contactName: 'Becky Brie',
  amount: 10000,
  memo: 'For new roof',
  type: 'payment',
  splits: [
    {
      id: 'split-1',
      accountId: '3',
      fundId: '2',
      programIds: ['p1'],
      eventIds: [],
      departmentIds: ['d3'],
      customIds: [],
      nineNinetyIds: ['n1'],
      percentage: 50,
      amount: 5000,
      lineDescription: '',
    },
    {
      id: 'split-2',
      accountId: '3',
      fundId: '1',
      programIds: ['p2', 'p4'],
      eventIds: ['e1'],
      departmentIds: [],
      customIds: ['c1'],
      nineNinetyIds: ['n2'],
      percentage: 25,
      amount: 2500,
      lineDescription: '',
    },
  ],
};

// Helper functions
export function getAccountById(id: string): Account | undefined {
  return accounts.find((a) => a.id === id);
}

export function getFundById(id: string): Fund | undefined {
  return funds.find((f) => f.id === id);
}

export function getContactById(id: string): Contact | undefined {
  return contacts.find((c) => c.id === id);
}

export function getTagById(categoryId: string, tagId: string): Tag | undefined {
  const category = tagCategories.find((c) => c.id === categoryId);
  return category?.tags.find((t) => t.id === tagId);
}

export function getTagsByIds(categoryId: string, tagIds: string[]): Tag[] {
  const category = tagCategories.find((c) => c.id === categoryId);
  if (!category) return [];
  return category.tags.filter((t) => tagIds.includes(t.id));
}

export function formatAccountDisplay(account: Account): string {
  return `${account.code} - ${account.name}`;
}

export function formatFundDisplay(fund: Fund): string {
  return fund.name;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatTagDisplay(tag: Tag): string {
  return `${tag.code} - ${tag.name}`;
}

// Generate empty split
export function createEmptySplit(totalAmount: number, existingSplits: Split[]): Split {
  const usedPercentage = existingSplits.reduce((sum, s) => sum + s.percentage, 0);
  const remainingPercentage = Math.max(0, 100 - usedPercentage);
  const remainingAmount = (remainingPercentage / 100) * totalAmount;
  
  return {
    id: `split-${Date.now()}`,
    accountId: '',
    fundId: '',
    programIds: [],
    eventIds: [],
    departmentIds: [],
    customIds: [],
    nineNinetyIds: [],
    percentage: remainingPercentage,
    amount: remainingAmount,
    lineDescription: '',
  };
}

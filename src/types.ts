export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  currency: string;
  monthlySavingsGoal?: number;
  createdAt: string;
  lastLoginAt: string;
}

export type IncomeSource = 
  | "Salary" 
  | "Freelance" 
  | "Investments" 
  | "Business" 
  | "Rental" 
  | "Gifts" 
  | "Refunds" 
  | "Other";

export interface IncomeEntry {
  id: string;
  amount: number;
  source: IncomeSource | string;
  category?: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  isRecurring?: boolean;
  createdAt: string;
}

export type ExpenseCategory =
  | "Housing & Rent"
  | "Groceries & Food"
  | "Dining Out"
  | "Utilities & Bills"
  | "Transportation"
  | "Healthcare & Medical"
  | "Entertainment & Leisure"
  | "Shopping & Apparel"
  | "Education"
  | "Personal Care"
  | "Subscriptions"
  | "Travel"
  | "Gifts & Donations"
  | "Miscellaneous";

export type PaymentMethod = 
  | "Credit Card" 
  | "Debit Card" 
  | "Cash" 
  | "Bank Transfer" 
  | "Digital Wallet / UPI" 
  | "Other";

export interface ExpenseEntry {
  id: string;
  amount: number;
  category: ExpenseCategory | string;
  paymentMethod: PaymentMethod | string;
  date: string; // YYYY-MM-DD
  notes?: string;
  tag?: string;
  isRecurring?: boolean;
  createdAt: string;
}

export interface BudgetEntry {
  id: string;
  category: ExpenseCategory | string;
  limit: number;
  monthYear: string; // YYYY-MM
  createdAt: string;
}

export interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: "safe" | "warning" | "danger" | "exceeded";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessageSnippet?: string;
}

export interface FinancialContextSnapshot {
  month: string;
  currency: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: string;
  categories: Array<{ name: string; total: number; percentage: number }>;
  budgets: Array<{ category: string; limit: number; spent: number; remaining: number; percentage: number; status: string }>;
  recentTransactions: Array<{
    type: "income" | "expense";
    date: string;
    amount: number;
    category?: string;
    source?: string;
    paymentMethod?: string;
    notes?: string;
  }>;
}

export interface FinancialAuditReport {
  healthScore: number;
  status: "Healthy" | "Attention Needed" | "Critical";
  headline: string;
  keyHighlights: string[];
  topRiskCategory: string;
  actionableTip: string;
}

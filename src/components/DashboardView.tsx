import React from "react";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  PiggyBank, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  Brain,
  ShieldCheck,
  Calendar,
  IndianRupee
} from "lucide-react";
import { 
  IncomeEntry, 
  ExpenseEntry, 
  BudgetStatus, 
  FinancialAuditReport 
} from "../types";
import { getCategoryMeta, getIncomeSourceMeta } from "../data/categories";

interface DashboardViewProps {
  selectedMonth: string;
  incomes: IncomeEntry[];
  expenses: ExpenseEntry[];
  budgetStatuses: BudgetStatus[];
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  aiAudit: FinancialAuditReport | null;
  isLoadingAudit: boolean;
  onRefreshAudit: () => void;
  onOpenAddModal: (type: "expense" | "income" | "budget") => void;
  onNavigateTab: (tab: string) => void;
  onEditExpense: (expense: ExpenseEntry) => void;
  onEditIncome: (income: IncomeEntry) => void;
  onDeleteExpense: (id: string) => void;
  onDeleteIncome: (id: string) => void;
  onSeedDemoData?: () => void;
  isSeedingDemo?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedMonth,
  incomes,
  expenses,
  budgetStatuses,
  totalIncome,
  totalExpenses,
  netSavings,
  savingsRate,
  aiAudit,
  isLoadingAudit,
  onRefreshAudit,
  onOpenAddModal,
  onNavigateTab,
  onEditExpense,
  onEditIncome,
  onDeleteExpense,
  onDeleteIncome,
  onSeedDemoData,
  isSeedingDemo = false,
}) => {
  // Format month name
  const [year, month] = selectedMonth.split("-").map(Number);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Combined recent transactions
  const combinedTransactions = [
    ...expenses.map(e => ({ ...e, type: "expense" as const })),
    ...incomes.map(i => ({ ...i, type: "income" as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  // Top spending category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const topCategoryEntries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Hero Metric Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#358E85] mb-1">
            <Sparkles className="w-4 h-4 text-[#4AA89E]" />
            <span>Monthly Financial Aura</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Financial Overview for {monthName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time balance calculations backed by user-isolated Cloud Firestore storage.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="dash-add-expense-btn"
            onClick={() => onOpenAddModal("expense")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] hover:from-[#F38573] hover:to-[#FF9A8B] text-slate-900 border border-[#FF9A8B]/60 rounded-2xl text-xs font-extrabold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <ArrowUpCircle className="w-3.5 h-3.5 text-slate-900" />
            <span>+ Add Expense</span>
          </button>
          <button
            id="dash-add-income-btn"
            onClick={() => onOpenAddModal("income")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#7ED4C9] to-[#4AA89E] hover:from-[#5BC0BE] hover:to-[#358E85] text-slate-900 border border-[#4AA89E]/40 rounded-2xl text-xs font-extrabold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-slate-900" />
            <span>+ Log Income</span>
          </button>
          <button
            id="dash-set-budget-btn"
            onClick={() => onOpenAddModal("budget")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#C6B9E0] to-[#8E7BB5] hover:from-[#B8A8D6] hover:to-[#7E6AA8] text-slate-900 border border-[#8E7BB5]/40 rounded-2xl text-xs font-extrabold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <PiggyBank className="w-3.5 h-3.5 text-slate-900" />
            <span>🎯 Set Budget</span>
          </button>
        </div>
      </div>

      {/* Demo Data Callout Banner if no records exist */}
      {incomes.length === 0 && expenses.length === 0 && onSeedDemoData && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-[#C6B9E0]/20 via-[#7ED4C9]/20 to-[#FFB7A5]/20 border border-[#7ED4C9]/50 rounded-3xl shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#7ED4C9]/40 flex items-center justify-center text-[#6B5A96] shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5 text-[#6B5A96]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                New to Aura Money? Load Sample Financial Records
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Populate your Cloud Firestore database with realistic income, expense categories (₹), and budget limits across the last 3 months.
              </p>
            </div>
          </div>
          <button
            id="dash-seed-demo-banner-btn"
            onClick={onSeedDemoData}
            disabled={isSeedingDemo}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7ED4C9] to-[#4AA89E] hover:from-[#5BC0BE] hover:to-[#358E85] text-slate-900 font-extrabold rounded-2xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer border border-[#4AA89E]/40 shrink-0 disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4 text-slate-900" />
            <span>{isSeedingDemo ? "Seeding Records..." : "✨ Load Demo Financial Data"}</span>
          </button>
        </div>
      )}

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white border border-[#7ED4C9]/30 rounded-3xl p-5 shadow-xs hover:border-[#7ED4C9]/60 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Income</span>
            <div className="w-8 h-8 rounded-xl bg-[#7ED4C9]/20 text-[#358E85] border border-[#7ED4C9]/40 flex items-center justify-center">
              <ArrowDownCircle className="w-4 h-4 text-[#4AA89E]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <p className="text-[11px] text-[#358E85] font-semibold mt-1">
              {incomes.length} {incomes.length === 1 ? "entry" : "entries"} logged
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white border border-[#FFB7A5]/40 rounded-3xl p-5 shadow-xs hover:border-[#FF9A8B]/70 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFB7A5]/25 text-[#E07A5F] border border-[#FFB7A5]/50 flex items-center justify-center">
              <ArrowUpCircle className="w-4 h-4 text-[#E07A5F]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <p className="text-[11px] text-[#E07A5F] font-semibold mt-1">
              {expenses.length} {expenses.length === 1 ? "transaction" : "transactions"} logged
            </p>
          </div>
        </div>

        {/* Net Savings */}
        <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-5 shadow-xs hover:border-[#7ED4C9]/70 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Net Savings</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              netSavings >= 0 ? "bg-[#7ED4C9]/20 text-[#358E85] border-[#7ED4C9]/40" : "bg-[#FFB7A5]/20 text-[#E07A5F] border-[#FFB7A5]/40"
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-black tracking-tight ${
              netSavings >= 0 ? "text-[#358E85]" : "text-[#E07A5F]"
            }`}>
              {netSavings < 0 ? "-" : ""}₹{Math.abs(netSavings).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {netSavings >= 0 ? "Surplus buffer" : "Deficit this month"}
            </p>
          </div>
        </div>

        {/* Savings Rate & Budget Health */}
        <div className="bg-white border border-[#C6B9E0]/40 rounded-3xl p-5 shadow-xs hover:border-[#C6B9E0]/70 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Savings Rate</span>
            <div className="w-8 h-8 rounded-xl bg-[#C6B9E0]/25 text-[#6B5A96] border border-[#C6B9E0]/50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#6B5A96] tracking-tight">
              {savingsRate}%
            </span>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Target: 20%+ recommended
            </p>
          </div>
        </div>
      </div>

      {/* AI Financial Advisor Insight Banner */}
      <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-aura-soft rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#7ED4C9]/25 text-[#358E85] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 border border-[#7ED4C9]/40">
                <Brain className="w-3.5 h-3.5 text-[#4AA89E]" />
                Gemini 3.6 Flash Advisor
              </span>
              {aiAudit?.status && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  aiAudit.status === "Healthy" 
                    ? "bg-[#7ED4C9]/20 text-[#358E85] border-[#7ED4C9]/40"
                    : "bg-[#FFB7A5]/25 text-[#E07A5F] border-[#FFB7A5]/40"
                }`}>
                  Status: {aiAudit.status}
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-bold text-slate-900">
              {aiAudit?.headline || "Real-Time AI Spending Assessment"}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              {aiAudit?.actionableTip || "Ask your AI advisor in the bottom-right for instant personalized budget recommendations or question specific expenses."}
            </p>

            {aiAudit?.keyHighlights && aiAudit.keyHighlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {aiAudit.keyHighlights.slice(0, 2).map((highlight, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4AA89E] shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              id="refresh-ai-audit-btn"
              onClick={onRefreshAudit}
              disabled={isLoadingAudit}
              className="px-4 py-2.5 bg-[#FBF7F0] hover:bg-white text-slate-700 border border-[#7ED4C9]/35 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {isLoadingAudit ? "Analyzing..." : "Re-run AI Audit"}
            </button>
            <button
              id="open-advisor-chat-btn"
              onClick={() => {
                const trigger = document.getElementById("aura-chatbot-trigger-btn");
                if (trigger) trigger.click();
              }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] hover:from-[#F38573] hover:to-[#FF9A8B] text-slate-900 font-extrabold rounded-2xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer border border-[#FF9A8B]/60"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              <span>Ask AI Chatbot</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-900" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Grid: Budget Status & Top Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Adherence Widget */}
        <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-[#6B5A96]" />
                Budget Limits &amp; Tracking
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Target limits set for {monthName}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("budgets")}
              className="text-xs font-bold text-[#358E85] hover:text-[#4AA89E] flex items-center gap-1 cursor-pointer"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {budgetStatuses.length === 0 ? (
            <div className="py-8 text-center bg-[#FBF7F0]/70 rounded-2xl border border-dashed border-[#7ED4C9]/40">
              <p className="text-xs text-slate-500">No category spending limits set for this month.</p>
              <button
                onClick={() => onOpenAddModal("budget")}
                className="mt-3 px-3.5 py-1.5 bg-[#7ED4C9]/20 text-[#358E85] border border-[#7ED4C9]/40 rounded-xl text-xs font-extrabold hover:bg-[#7ED4C9]/30 transition-all cursor-pointer"
              >
                + Set Your First Budget
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetStatuses.slice(0, 4).map((b) => {
                const meta = getCategoryMeta(b.category);
                const Icon = meta.icon;
                return (
                  <div key={b.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-xl ${meta.bgColor} ${meta.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-extrabold text-slate-800">{b.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900">₹{b.spent.toFixed(0)}</span>
                        <span className="text-slate-500 font-medium"> / ₹{b.limit.toFixed(0)}</span>
                        <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          b.status === "safe"
                            ? "bg-[#7ED4C9]/20 text-[#358E85] border-[#7ED4C9]/40"
                            : b.status === "warning"
                            ? "bg-[#C6B9E0]/25 text-[#6B5A96] border-[#C6B9E0]/40"
                            : "bg-[#FFB7A5]/25 text-[#E07A5F] border-[#FFB7A5]/40"
                        }`}>
                          {b.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-[#FBF7F0] h-2 rounded-full overflow-hidden border border-[#7ED4C9]/25">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          b.percentage > 100
                            ? "bg-[#FF9A8B]"
                            : b.percentage > 85
                            ? "bg-[#FFB7A5]"
                            : "bg-[#7ED4C9]"
                        }`}
                        style={{ width: `${Math.min(b.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Expense Categories Breakdown */}
        <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4 text-[#E07A5F]" />
                Category Spending Distribution
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Highest expense areas for {monthName}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("expenses")}
              className="text-xs font-bold text-[#E07A5F] hover:text-[#FF9A8B] flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {topCategoryEntries.length === 0 ? (
            <div className="py-8 text-center bg-[#FBF7F0]/70 rounded-2xl border border-dashed border-[#7ED4C9]/40">
              <p className="text-xs text-slate-500">No expenses recorded for this month.</p>
              <button
                onClick={() => onOpenAddModal("expense")}
                className="mt-3 px-3.5 py-1.5 bg-[#FFB7A5]/25 text-[#E07A5F] border border-[#FFB7A5]/45 rounded-xl text-xs font-extrabold hover:bg-[#FFB7A5]/35 transition-all cursor-pointer"
              >
                + Record An Expense
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {topCategoryEntries.slice(0, 4).map(([catName, amount]) => {
                const meta = getCategoryMeta(catName);
                const Icon = meta.icon;
                const percent = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
                return (
                  <div key={catName} className="flex items-center justify-between p-3 rounded-2xl bg-[#FBF7F0] border border-[#7ED4C9]/25 hover:border-[#7ED4C9]/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-2xl ${meta.bgColor} ${meta.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">{catName}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{percent}% of total monthly expenses</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-[#E07A5F]">₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#358E85]" />
              Recent Financial Transactions
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Latest logged incomes and expenses
            </p>
          </div>
        </div>

        {combinedTransactions.length === 0 ? (
          <div className="py-10 text-center bg-[#FBF7F0]/70 rounded-2xl border border-dashed border-[#7ED4C9]/40">
            <p className="text-xs text-slate-500">No financial transactions logged yet for this month.</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                onClick={() => onOpenAddModal("expense")}
                className="px-3.5 py-1.5 bg-[#FFB7A5]/25 text-[#E07A5F] border border-[#FFB7A5]/45 rounded-xl text-xs font-extrabold hover:bg-[#FFB7A5]/35 transition-all cursor-pointer"
              >
                + Add Expense
              </button>
              <button
                onClick={() => onOpenAddModal("income")}
                className="px-3.5 py-1.5 bg-[#7ED4C9]/20 text-[#358E85] border border-[#7ED4C9]/40 rounded-xl text-xs font-extrabold hover:bg-[#7ED4C9]/30 transition-all cursor-pointer"
              >
                + Log Income
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#7ED4C9]/20 bg-[#FBF7F0]/60 text-slate-600 font-bold">
                  <th className="py-3.5 pl-4">Type</th>
                  <th className="py-3.5">Source / Category</th>
                  <th className="py-3.5">Date</th>
                  <th className="py-3.5">Method / Notes</th>
                  <th className="py-3.5 text-right pr-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {combinedTransactions.map((tx) => {
                  const isExp = tx.type === "expense";
                  const meta = isExp 
                    ? getCategoryMeta((tx as ExpenseEntry).category)
                    : getIncomeSourceMeta((tx as IncomeEntry).source);
                  const Icon = meta.icon;

                  return (
                    <tr key={tx.id} className="hover:bg-[#FBF7F0]/80 transition-colors">
                      <td className="py-3.5 pl-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          isExp ? "bg-[#FFB7A5]/25 text-[#E07A5F] border-[#FFB7A5]/40" : "bg-[#7ED4C9]/20 text-[#358E85] border-[#7ED4C9]/40"
                        }`}>
                          {isExp ? "Expense" : "Income"}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-xl ${meta.bgColor} ${meta.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-extrabold text-slate-800">
                            {isExp ? (tx as ExpenseEntry).category : (tx as IncomeEntry).source}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-500 font-medium">
                        {tx.date}
                      </td>
                      <td className="py-3.5 text-slate-500">
                        {isExp ? (
                          <span className="text-[11px] font-medium">
                            {(tx as ExpenseEntry).paymentMethod}
                            {tx.notes ? ` • ${tx.notes}` : ""}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium">
                            {(tx as IncomeEntry).isRecurring ? "Recurring" : "Direct"}
                            {tx.notes ? ` • ${tx.notes}` : ""}
                          </span>
                        )}
                      </td>
                      <td className={`py-3.5 text-right pr-4 font-black text-sm ${
                        isExp ? "text-[#E07A5F]" : "text-[#358E85]"
                      }`}>
                        {isExp ? "-" : "+"}₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

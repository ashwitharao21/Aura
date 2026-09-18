import React, { useState, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  Legend,
  Line
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Calendar, 
  Clock, 
  Sparkles, 
  ArrowDownCircle, 
  ArrowUpCircle,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Table,
  Layers,
  X,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { 
  IncomeEntry, 
  ExpenseEntry, 
  BudgetStatus, 
  ChatSession 
} from "../types";
import { EXPENSE_CATEGORIES, getCategoryMeta, getIncomeSourceMeta } from "../data/categories";

interface ReportsViewProps {
  selectedMonth: string;
  incomes: IncomeEntry[];
  expenses: ExpenseEntry[];
  budgetStatuses: BudgetStatus[];
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  chatSessions: ChatSession[];
  onSeedDemoData?: () => void;
  isSeedingDemo?: boolean;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  selectedMonth,
  incomes,
  expenses,
  budgetStatuses,
  totalIncome,
  totalExpenses,
  netSavings,
  savingsRate,
  chatSessions,
  onSeedDemoData,
  isSeedingDemo = false,
}) => {
  const [reportTab, setReportTab] = useState<"visuals" | "timeline">("visuals");
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Format month
  const [year, month] = selectedMonth.split("-").map(Number);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // 1. Comparison Data (Income vs Expense)
  const comparisonData = useMemo(() => [
    { name: "Income", amount: totalIncome, fill: "#4AA89E" },
    { name: "Expenses", amount: totalExpenses, fill: "#FF9A8B" },
    { name: "Net Savings", amount: Math.max(0, netSavings), fill: "#7ED4C9" },
  ], [totalIncome, totalExpenses, netSavings]);

  // 2. Category Donut Data
  const categoryPieData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });

    return Object.entries(map).map(([name, value]) => {
      const meta = getCategoryMeta(name);
      return {
        name,
        value,
        color: meta.chartColor || "#64748b",
      };
    }).sort((a, b) => b.value - a.value);
  }, [expenses]);

  // 3. Daily Trajectory Line Data
  const dailyTrajectoryData = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const map: Record<number, { expense: number; income: number }> = {};
    
    for (let i = 1; i <= daysInMonth; i++) {
      map[i] = { expense: 0, income: 0 };
    }

    expenses.forEach((e) => {
      const day = parseInt(e.date.split("-")[2], 10);
      if (map[day]) {
        map[day].expense += e.amount;
      }
    });

    incomes.forEach((i) => {
      const day = parseInt(i.date.split("-")[2], 10);
      if (map[day]) {
        map[day].income += i.amount;
      }
    });

    let cumulativeExpense = 0;
    return Object.entries(map).map(([day, val]) => {
      cumulativeExpense += val.expense;
      return {
        dayNum: parseInt(day, 10),
        day: `Day ${day}`,
        DailySpend: val.expense,
        CumulativeSpend: cumulativeExpense,
        DailyIncome: val.income,
      };
    });
  }, [expenses, incomes, year, month]);

  // 4. Budget vs Actual Comparison Data
  const budgetComparisonData = useMemo(() => {
    return budgetStatuses.map((b) => ({
      category: b.category.split("&")[0].trim(), // shorten for chart labels
      fullName: b.category,
      Limit: b.limit,
      Spent: b.spent,
      remaining: b.remaining,
      percentage: b.percentage,
      isOverBudget: b.isOverBudget,
    }));
  }, [budgetStatuses]);

  // 5. Combined Timeline Events
  const timelineEvents = useMemo(() => {
    const events: Array<{
      id: string;
      date: string;
      title: string;
      type: "income" | "expense" | "ai_consultation";
      amount?: number;
      subtitle?: string;
    }> = [];

    incomes.forEach((i) => {
      events.push({
        id: `inc-${i.id}`,
        date: i.date,
        title: `Income: ${i.source}`,
        type: "income",
        amount: i.amount,
        subtitle: i.notes || (i.isRecurring ? "Recurring income" : "Direct deposit"),
      });
    });

    expenses.forEach((e) => {
      events.push({
        id: `exp-${e.id}`,
        date: e.date,
        title: `Expense: ${e.category}`,
        type: "expense",
        amount: e.amount,
        subtitle: `${e.paymentMethod}${e.notes ? ` • ${e.notes}` : ""}`,
      });
    });

    chatSessions.forEach((s) => {
      events.push({
        id: `ai-${s.id}`,
        date: s.updatedAt.substring(0, 10),
        title: `AI Financial Advisory Consultation`,
        type: "ai_consultation",
        subtitle: s.title || s.lastMessageSnippet || "AI Advisor session",
      });
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incomes, expenses, chatSessions]);

  // Escape helper for CSV cells
  const escapeCell = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  // Safe file downloader using Blob + UTF-8 BOM for Excel/Sheets compatibility
  const triggerDownload = (filename: string, csvContent: string) => {
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. Comprehensive Financial Summary & Trends Report CSV
  const handleExportFullReport = () => {
    const lines: string[] = [];

    // Header Meta
    lines.push("================================================================================");
    lines.push(`FINANCIAL SUMMARY & TRENDS REPORT - ${monthName.toUpperCase()}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push("================================================================================");
    lines.push("");

    // Section 1: Executive KPI Summary
    lines.push("--- 1. EXECUTIVE FINANCIAL SUMMARY ---");
    lines.push("Metric,Amount (₹),Percentage / Status,Notes");
    lines.push(`Total Inflow / Income,${totalIncome.toFixed(2)},100.0%,All recorded income channels`);
    lines.push(`Total Outflow / Expenses,${totalExpenses.toFixed(2)},${((totalExpenses / (totalIncome || 1)) * 100).toFixed(1)}%,All recorded expense categories`);
    lines.push(`Net Savings Buffer,${netSavings.toFixed(2)},${savingsRate.toFixed(1)}%,${netSavings >= 0 ? "Positive Net Cashflow" : "Deficit / Overspend"}`);
    lines.push(`Savings Rate,${savingsRate.toFixed(1)}%,-,Net savings divided by total income`);
    lines.push("");

    // Section 2: Category Breakdown & Budget Adherence
    lines.push("--- 2. CATEGORY BREAKDOWN & BUDGET ADHERENCE ---");
    lines.push("Category,Actual Spent (₹),Budget Limit (₹),Variance / Remaining (₹),Budget Used (%),Status");
    if (budgetComparisonData.length > 0) {
      budgetComparisonData.forEach((b) => {
        const status = b.isOverBudget ? "OVER BUDGET" : b.percentage >= 90 ? "WARNING (90%+)" : "WITHIN BUDGET";
        lines.push([
          escapeCell(b.fullName),
          b.Spent.toFixed(2),
          b.Limit.toFixed(2),
          b.remaining.toFixed(2),
          `${b.percentage.toFixed(1)}%`,
          escapeCell(status),
        ].join(","));
      });
    } else if (categoryPieData.length > 0) {
      categoryPieData.forEach((c) => {
        lines.push([
          escapeCell(c.name),
          c.value.toFixed(2),
          "N/A",
          "N/A",
          `${((c.value / (totalExpenses || 1)) * 100).toFixed(1)}% of total spend`,
          escapeCell("No Limit Defined"),
        ].join(","));
      });
    } else {
      lines.push("No expense categories recorded for this period");
    }
    lines.push("");

    // Section 3: Daily Spending Trends Trajectory
    lines.push("--- 3. DAILY SPENDING TRENDS & CUMULATIVE TRAJECTORY ---");
    lines.push("Day of Month,Date,Daily Spend (₹),Daily Income (₹),Daily Net Cashflow (₹),Month-To-Date Cumulative Spend (₹)");
    dailyTrajectoryData.forEach((d) => {
      const dateStr = `${selectedMonth}-${String(d.dayNum).padStart(2, "0")}`;
      const dailyNet = d.DailyIncome - d.DailySpend;
      lines.push([
        escapeCell(d.day),
        dateStr,
        d.DailySpend.toFixed(2),
        d.DailyIncome.toFixed(2),
        dailyNet.toFixed(2),
        d.CumulativeSpend.toFixed(2),
      ].join(","));
    });
    lines.push("");

    // Section 4: Itemized Incomes
    lines.push("--- 4. ITEMIZED INCOMES ---");
    lines.push("ID,Date,Income Source,Amount (₹),Recurring,Notes");
    if (incomes.length > 0) {
      incomes.forEach((i) => {
        lines.push([
          escapeCell(i.id),
          i.date,
          escapeCell(i.source),
          i.amount.toFixed(2),
          i.isRecurring ? "Yes" : "No",
          escapeCell(i.notes || ""),
        ].join(","));
      });
    } else {
      lines.push("No income entries recorded for this period");
    }
    lines.push("");

    // Section 5: Itemized Expenses
    lines.push("--- 5. ITEMIZED EXPENSES ---");
    lines.push("ID,Date,Category,Amount (₹),Payment Method,Notes");
    if (expenses.length > 0) {
      expenses.forEach((e) => {
        lines.push([
          escapeCell(e.id),
          e.date,
          escapeCell(e.category),
          e.amount.toFixed(2),
          escapeCell(e.paymentMethod),
          escapeCell(e.notes || ""),
        ].join(","));
      });
    } else {
      lines.push("No expense entries recorded for this period");
    }

    triggerDownload(`Comprehensive_Financial_Summary_and_Trends_${selectedMonth}.csv`, lines.join("\r\n"));
    setShowExportModal(false);
  };

  // 2. Daily Trends Trajectory Only CSV
  const handleExportTrendsOnly = () => {
    const lines: string[] = [];
    lines.push(`DAILY FINANCIAL TRENDS & SPENDING TRAJECTORY - ${monthName.toUpperCase()}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push("Day,Date,Daily Spend (₹),Daily Income (₹),Daily Net Cashflow (₹),Month-to-Date Cumulative Spend (₹)");
    
    dailyTrajectoryData.forEach((d) => {
      const dateStr = `${selectedMonth}-${String(d.dayNum).padStart(2, "0")}`;
      const dailyNet = d.DailyIncome - d.DailySpend;
      lines.push([
        escapeCell(d.day),
        dateStr,
        d.DailySpend.toFixed(2),
        d.DailyIncome.toFixed(2),
        dailyNet.toFixed(2),
        d.CumulativeSpend.toFixed(2),
      ].join(","));
    });

    triggerDownload(`Daily_Spending_Trends_${selectedMonth}.csv`, lines.join("\r\n"));
    setShowExportModal(false);
  };

  // 3. Category Budgets & Variance CSV
  const handleExportBudgetsOnly = () => {
    const lines: string[] = [];
    lines.push(`CATEGORY BUDGET ADHERENCE & VARIANCE REPORT - ${monthName.toUpperCase()}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push("Category,Actual Spend (₹),Budget Limit (₹),Remaining Buffer (₹),Budget Utilization (%),Status");
    
    budgetComparisonData.forEach((b) => {
      const status = b.isOverBudget ? "OVER BUDGET" : b.percentage >= 90 ? "WARNING (90%+)" : "WITHIN BUDGET";
      lines.push([
        escapeCell(b.fullName),
        b.Spent.toFixed(2),
        b.Limit.toFixed(2),
        b.remaining.toFixed(2),
        `${b.percentage.toFixed(1)}%`,
        escapeCell(status),
      ].join(","));
    });

    triggerDownload(`Budget_Adherence_Report_${selectedMonth}.csv`, lines.join("\r\n"));
    setShowExportModal(false);
  };

  // 4. Raw Itemized Transactions CSV
  const handleExportTransactionsOnly = () => {
    const lines: string[] = [];
    lines.push("Type,ID,Date,Category / Source,Amount (₹),Payment Method / Recurring,Notes");
    
    incomes.forEach((i) => {
      lines.push([
        "Income",
        escapeCell(i.id),
        i.date,
        escapeCell(i.source),
        i.amount.toFixed(2),
        i.isRecurring ? "Recurring" : "One-off",
        escapeCell(i.notes || ""),
      ].join(","));
    });

    expenses.forEach((e) => {
      lines.push([
        "Expense",
        escapeCell(e.id),
        e.date,
        escapeCell(e.category),
        e.amount.toFixed(2),
        escapeCell(e.paymentMethod),
        escapeCell(e.notes || ""),
      ].join(","));
    });

    triggerDownload(`Itemized_Transactions_${selectedMonth}.csv`, lines.join("\r\n"));
    setShowExportModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#6B5A96] mb-1">
            <BarChart3 className="w-4 h-4 text-[#8E7BB5]" />
            <span>Financial Analytics &amp; Reports</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Visual Insights for {monthName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual spending trends, category proportions, budget adherence, and chronological logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-[#FBF7F0] p-1 rounded-2xl border border-[#7ED4C9]/30 flex items-center">
            <button
              onClick={() => setReportTab("visuals")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                reportTab === "visuals"
                  ? "bg-white text-[#358E85] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Visual Charts
            </button>
            <button
              onClick={() => setReportTab("timeline")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                reportTab === "timeline"
                  ? "bg-white text-[#358E85] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Historical Timeline
            </button>
          </div>

          <button
            id="export-csv-btn"
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] hover:from-[#F38573] hover:to-[#FF9A8B] text-slate-900 rounded-2xl text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer border border-[#FF9A8B]/60"
            title="Export Financial Summary & Trends as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-900" />
            <span>Export CSV</span>
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
                Generate Instant Financial Visualizations
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Load sample income, expenses, and budget adherence data into Firestore to test charts, interactive donuts, trajectory graphs, and CSV exports.
              </p>
            </div>
          </div>
          <button
            id="reports-seed-demo-banner-btn"
            onClick={onSeedDemoData}
            disabled={isSeedingDemo}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7ED4C9] to-[#4AA89E] hover:from-[#5BC0BE] hover:to-[#358E85] text-slate-900 font-extrabold rounded-2xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer border border-[#4AA89E]/40 shrink-0 disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4 text-slate-900" />
            <span>{isSeedingDemo ? "Seeding Records..." : "✨ Load Demo Financial Data"}</span>
          </button>
        </div>
      )}

      {reportTab === "visuals" ? (
        <div className="space-y-6">
          {/* Top Charts Grid: Income vs Expense + Category Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Cashflow Overview Bar Chart */}
            <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Monthly Cashflow Overview</h3>
                  <p className="text-[11px] text-slate-500">Total Income vs Total Outflow</p>
                </div>
                <span className="text-xs font-bold text-[#358E85]">
                  {savingsRate}% Savings Rate
                </span>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "12px", color: "#0f172a", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, "Amount"]}
                    />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Category Expense Breakdown Donut */}
            <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Expense Category Distribution</h3>
                  <p className="text-[11px] text-slate-500">Where your money goes</p>
                </div>
                <span className="text-xs font-bold text-[#E07A5F]">
                  ₹{totalExpenses.toFixed(2)} Total
                </span>
              </div>

              {categoryPieData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  No expense data to display for this month.
                </div>
              ) : (
                <div className="h-64 w-full flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={categoryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "12px", color: "#0f172a", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                        formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, "Spent"]}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", color: "#475569" }} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Chart 3: Cumulative Daily Spending Trajectory */}
          <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Daily Spending Trajectory &amp; Accumulation</h3>
                <p className="text-[11px] text-slate-500">Daily outflow trend over {monthName}</p>
              </div>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrajectoryData}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF9A8B" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#FF9A8B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} interval={4} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "12px", color: "#0f172a", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, ""]}
                  />
                  <Area type="monotone" dataKey="CumulativeSpend" stroke="#FF9A8B" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" name="Cumulative Spend" />
                  <Line type="monotone" dataKey="DailySpend" stroke="#4AA89E" strokeWidth={2} dot={false} name="Daily Spend" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Budget Limit vs Actual Spend */}
          {budgetComparisonData.length > 0 && (
            <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Budget Limit vs. Actual Expenditure</h3>
                  <p className="text-[11px] text-slate-500">Category spending adherence analysis</p>
                </div>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                    <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "12px", color: "#0f172a", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, ""]}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", color: "#475569" }} />
                    <Bar dataKey="Limit" fill="#4AA89E" radius={[6, 6, 0, 0]} name="Planned Limit" />
                    <Bar dataKey="Spent" fill="#FF9A8B" radius={[6, 6, 0, 0]} name="Actual Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Historical Timeline of Past Entries & AI Consultations */
        <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#7ED4C9]/20 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Historical Activity Timeline</h3>
              <p className="text-[11px] text-slate-500">All financial recordings and AI advisory consultations</p>
            </div>
            <span className="text-xs text-slate-500">{timelineEvents.length} Total Events</span>
          </div>

          {timelineEvents.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No historical entries or AI consultations recorded yet.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#7ED4C9]/30">
              {timelineEvents.map((event) => {
                const isInc = event.type === "income";
                const isExp = event.type === "expense";
                const isAi = event.type === "ai_consultation";

                return (
                  <div key={event.id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div className={`absolute -left-[27px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white ${
                      isInc ? "bg-[#4AA89E]" : isExp ? "bg-[#FF9A8B]" : "bg-[#6B5A96]"
                    }`} />

                    <div className="p-4 rounded-2xl bg-[#FBF7F0]/60 border border-[#7ED4C9]/30 hover:border-[#4AA89E]/50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          isInc ? "bg-[#7ED4C9]/20 text-[#358E85]" : isExp ? "bg-[#FFB7A5]/25 text-[#E07A5F]" : "bg-[#C6B9E0]/25 text-[#6B5A96]"
                        }`}>
                          {isInc && <ArrowDownCircle className="w-4 h-4" />}
                          {isExp && <ArrowUpCircle className="w-4 h-4" />}
                          {isAi && <Sparkles className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{event.title}</p>
                          <p className="text-[11px] text-slate-500">{event.subtitle}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        {event.amount !== undefined && (
                          <p className={`text-xs font-black ${isInc ? "text-[#358E85]" : "text-[#E07A5F]"}`}>
                            {isInc ? "+" : "-"}₹{event.amount.toFixed(2)}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-500 font-medium">{event.date}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Export CSV Modal */}
      {showExportModal && (
        <div 
          id="export-csv-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-csv-title"
        >
          <div className="bg-white border border-[#7ED4C9]/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#7ED4C9]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#C6B9E0]/25 text-[#6B5A96] rounded-2xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="export-csv-title" className="text-base font-extrabold text-slate-900">
                    Export Financial Summary &amp; Trends
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select a CSV format to export your financial data for {monthName}
                  </p>
                </div>
              </div>
              <button
                id="close-export-modal-btn"
                onClick={() => setShowExportModal(false)}
                className="p-1.5 hover:bg-[#FBF7F0] text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                aria-label="Close export dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Primary Option: Comprehensive Summary & Trends */}
            <div className="bg-[#FBF7F0] border border-[#7ED4C9]/40 rounded-2xl p-4.5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Comprehensive Financial Report</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[#7ED4C9]/30 text-[#358E85] rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Includes all 5 key financial sections in a structured spreadsheet: Executive KPIs, Category Breakdown &amp; Budgets, Daily Inflow/Outflow Trends, Cumulative Trajectory, and Itemized Logs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="bg-white border border-[#7ED4C9]/30 rounded-xl p-2 text-center">
                  <p className="text-[10px] text-slate-500 font-medium">Inflow</p>
                  <p className="text-xs font-bold text-[#358E85]">₹{totalIncome.toFixed(0)}</p>
                </div>
                <div className="bg-white border border-[#FFB7A5]/35 rounded-xl p-2 text-center">
                  <p className="text-[10px] text-slate-500 font-medium">Outflow</p>
                  <p className="text-xs font-bold text-[#E07A5F]">₹{totalExpenses.toFixed(0)}</p>
                </div>
                <div className="bg-white border border-[#C6B9E0]/35 rounded-xl p-2 text-center">
                  <p className="text-[10px] text-slate-500 font-medium">Savings Rate</p>
                  <p className="text-xs font-bold text-[#6B5A96]">{savingsRate}%</p>
                </div>
                <div className="bg-white border border-[#7ED4C9]/30 rounded-xl p-2 text-center">
                  <p className="text-[10px] text-slate-500 font-medium">Days Tracked</p>
                  <p className="text-xs font-bold text-slate-700">{dailyTrajectoryData.length} Days</p>
                </div>
              </div>

              <button
                id="download-full-csv-btn"
                onClick={handleExportFullReport}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#7ED4C9] to-[#4AA89E] hover:from-[#5BC0BE] hover:to-[#358E85] text-slate-900 text-xs font-extrabold rounded-2xl shadow-sm transition-all active:scale-[0.98] cursor-pointer border border-[#4AA89E]/40"
              >
                <Download className="w-4 h-4 text-slate-900" />
                <span>Download Comprehensive Summary &amp; Trends (CSV)</span>
              </button>
            </div>

            {/* Granular Export Options */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-700">Or Export Specific Datasets:</p>

              {/* Option 2: Daily Spending & Inflow Trends */}
              <button
                id="download-trends-csv-btn"
                onClick={handleExportTrendsOnly}
                className="w-full flex items-center justify-between p-3.5 bg-[#FBF7F0]/60 hover:bg-[#FBF7F0] border border-[#7ED4C9]/30 rounded-2xl transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FFB7A5]/30 text-[#E07A5F] rounded-xl group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Daily Spending Trends &amp; Cumulative Trajectory</p>
                    <p className="text-[11px] text-slate-500">Day-by-day daily spend, daily income, net flow, and cumulative burn rate.</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0 ml-2" />
              </button>

              {/* Option 3: Category Budgets & Variance */}
              <button
                id="download-budgets-csv-btn"
                onClick={handleExportBudgetsOnly}
                className="w-full flex items-center justify-between p-3.5 bg-[#FBF7F0]/60 hover:bg-[#FBF7F0] border border-[#7ED4C9]/30 rounded-2xl transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#7ED4C9]/25 text-[#358E85] rounded-xl group-hover:scale-105 transition-transform">
                    <PieIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Category Budgets &amp; Adherence Variance</p>
                    <p className="text-[11px] text-slate-500">Actual spend vs. target limits, remaining allowance, and percentage status.</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0 ml-2" />
              </button>

              {/* Option 4: Itemized Transactions */}
              <button
                id="download-transactions-csv-btn"
                onClick={handleExportTransactionsOnly}
                className="w-full flex items-center justify-between p-3.5 bg-[#FBF7F0]/60 hover:bg-[#FBF7F0] border border-[#7ED4C9]/30 rounded-2xl transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#C6B9E0]/25 text-[#6B5A96] rounded-xl group-hover:scale-105 transition-transform">
                    <Table className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Itemized Transactions Log</p>
                    <p className="text-[11px] text-slate-500">Raw ledger of all recorded incomes and expenses with dates and notes.</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0 ml-2" />
              </button>
            </div>

            {/* Privacy Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[#7ED4C9]/20 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-[#358E85]" />
                Data processed securely on-device with UTF-8 BOM encoding
              </span>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

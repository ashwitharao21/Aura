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
  ChevronLeft,
  ShieldCheck,
  CalendarDays,
  FileDown
} from "lucide-react";
import { 
  IncomeEntry, 
  ExpenseEntry, 
  BudgetStatus,
  BudgetEntry
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
  allIncomes?: IncomeEntry[];
  allExpenses?: ExpenseEntry[];
  allBudgets?: BudgetEntry[];
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
  allIncomes = [],
  allExpenses = [],
  allBudgets = [],
}) => {
  // Use allIncomes/allExpenses fallback to monthly if empty
  const safeAllIncomes = allIncomes.length > 0 ? allIncomes : incomes;
  const safeAllExpenses = allExpenses.length > 0 ? allExpenses : expenses;

  // View state
  const [timeframe, setTimeframe] = useState<"monthly" | "yearly">("monthly");
  const [reportTab, setReportTab] = useState<"visuals" | "timeline">("visuals");
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportScope, setExportScope] = useState<"month" | "year">("month");

  // Selected Year state (derived initially from selectedMonth)
  const [yearStr, monthStr] = selectedMonth.split("-");
  const initialYear = yearStr || String(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);

  // Available Years list from data
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    yearsSet.add(initialYear);
    yearsSet.add(String(new Date().getFullYear()));
    safeAllIncomes.forEach((i) => {
      if (i.date) yearsSet.add(i.date.substring(0, 4));
    });
    safeAllExpenses.forEach((e) => {
      if (e.date) yearsSet.add(e.date.substring(0, 4));
    });
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [safeAllIncomes, safeAllExpenses, initialYear]);

  // Format month
  const year = Number(yearStr);
  const month = Number(monthStr);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // ---------------------------------------------------------------------------
  // 1. MONTHLY CALCULATIONS
  // ---------------------------------------------------------------------------

  // Monthly Comparison Data (Income vs Expense vs Net Savings)
  const comparisonData = useMemo(() => [
    { name: "Income", amount: totalIncome, fill: "#4AA89E" },
    { name: "Expenses", amount: totalExpenses, fill: "#FF9A8B" },
    { name: "Net Savings", amount: Math.max(0, netSavings), fill: "#7ED4C9" },
  ], [totalIncome, totalExpenses, netSavings]);

  // Monthly Category Donut Data
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

  // Monthly Daily Trajectory Line Data
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

  // Monthly Budget vs Actual Comparison Data
  const budgetComparisonData = useMemo(() => {
    return budgetStatuses.map((b) => ({
      category: b.category.split("&")[0].trim(),
      fullName: b.category,
      Limit: b.limit,
      Spent: b.spent,
      remaining: b.remaining,
      percentage: b.percentage,
      isOverBudget: b.status === "exceeded",
    }));
  }, [budgetStatuses]);

  // ---------------------------------------------------------------------------
  // 2. YEARLY CALCULATIONS
  // ---------------------------------------------------------------------------

  // Yearly filtered entries
  const yearlyIncomes = useMemo(() => {
    return safeAllIncomes.filter((i) => i.date && i.date.startsWith(selectedYear));
  }, [safeAllIncomes, selectedYear]);

  const yearlyExpenses = useMemo(() => {
    return safeAllExpenses.filter((e) => e.date && e.date.startsWith(selectedYear));
  }, [safeAllExpenses, selectedYear]);

  const yearlyTotalIncome = useMemo(() => {
    return yearlyIncomes.reduce((sum, i) => sum + i.amount, 0);
  }, [yearlyIncomes]);

  const yearlyTotalExpenses = useMemo(() => {
    return yearlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [yearlyExpenses]);

  const yearlyNetSavings = yearlyTotalIncome - yearlyTotalExpenses;
  const yearlySavingsRate = yearlyTotalIncome > 0
    ? Math.max(0, Math.round((yearlyNetSavings / yearlyTotalIncome) * 100))
    : 0;

  // 12-Month Cashflow Breakdown for selectedYear (Jan to Dec)
  const monthlyCashflow12 = useMemo(() => {
    const monthDefs = [
      { num: "01", short: "Jan", full: "January" },
      { num: "02", short: "Feb", full: "February" },
      { num: "03", short: "Mar", full: "March" },
      { num: "04", short: "Apr", full: "April" },
      { num: "05", short: "May", full: "May" },
      { num: "06", short: "Jun", full: "June" },
      { num: "07", short: "Jul", full: "July" },
      { num: "08", short: "Aug", full: "August" },
      { num: "09", short: "Sep", full: "September" },
      { num: "10", short: "Oct", full: "October" },
      { num: "11", short: "Nov", full: "November" },
      { num: "12", short: "Dec", full: "December" },
    ];

    let runningSavings = 0;

    return monthDefs.map((m) => {
      const monthPrefix = `${selectedYear}-${m.num}`;
      const mIncomes = yearlyIncomes.filter((i) => i.date.startsWith(monthPrefix));
      const mExpenses = yearlyExpenses.filter((e) => e.date.startsWith(monthPrefix));

      const incomeVal = mIncomes.reduce((acc, i) => acc + i.amount, 0);
      const expenseVal = mExpenses.reduce((acc, e) => acc + e.amount, 0);
      const netVal = incomeVal - expenseVal;
      runningSavings += netVal;
      const rateVal = incomeVal > 0 ? Math.max(0, Math.round((netVal / incomeVal) * 100)) : 0;

      return {
        monthKey: monthPrefix,
        month: m.short,
        fullName: m.full,
        Income: incomeVal,
        Expenses: expenseVal,
        NetSavings: netVal,
        CumulativeNet: runningSavings,
        SavingsRate: rateVal,
        hasActivity: incomeVal > 0 || expenseVal > 0,
        transactionCount: mIncomes.length + mExpenses.length,
      };
    });
  }, [yearlyIncomes, yearlyExpenses, selectedYear]);

  // Active months count in the year
  const activeMonthsCount = useMemo(() => {
    return monthlyCashflow12.filter((m) => m.hasActivity).length;
  }, [monthlyCashflow12]);

  // Yearly Category Expense Breakdown (Donut + Table)
  const yearlyCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    yearlyExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });

    return Object.entries(map).map(([name, value]) => {
      const meta = getCategoryMeta(name);
      const percent = yearlyTotalExpenses > 0 ? (value / yearlyTotalExpenses) * 100 : 0;
      const monthlyAvg = activeMonthsCount > 0 ? value / activeMonthsCount : value / 12;
      return {
        name,
        value,
        percentage: percent,
        monthlyAvg,
        color: meta.chartColor || "#64748b",
      };
    }).sort((a, b) => b.value - a.value);
  }, [yearlyExpenses, yearlyTotalExpenses, activeMonthsCount]);

  // Yearly Income Sources Breakdown
  const yearlyIncomeSourcesData = useMemo(() => {
    const map: Record<string, number> = {};
    yearlyIncomes.forEach((i) => {
      map[i.source] = (map[i.source] || 0) + i.amount;
    });

    return Object.entries(map).map(([name, value]) => {
      const percent = yearlyTotalIncome > 0 ? (value / yearlyTotalIncome) * 100 : 0;
      return {
        source: name,
        amount: value,
        percentage: percent,
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [yearlyIncomes, yearlyTotalIncome]);

  // ---------------------------------------------------------------------------
  // 3. TIMELINE EVENTS (Monthly & Yearly)
  // ---------------------------------------------------------------------------
  const timelineEvents = useMemo(() => {
    const activeIncomes = timeframe === "yearly" ? yearlyIncomes : incomes;
    const activeExpenses = timeframe === "yearly" ? yearlyExpenses : expenses;

    const events: Array<{
      id: string;
      date: string;
      title: string;
      type: "income" | "expense";
      amount?: number;
      subtitle?: string;
    }> = [];

    activeIncomes.forEach((i) => {
      events.push({
        id: `inc-${i.id}`,
        date: i.date,
        title: `Income: ${i.source}`,
        type: "income",
        amount: i.amount,
        subtitle: i.notes || (i.isRecurring ? "Recurring income" : "Direct deposit"),
      });
    });

    activeExpenses.forEach((e) => {
      events.push({
        id: `exp-${e.id}`,
        date: e.date,
        title: `Expense: ${e.category}`,
        type: "expense",
        amount: e.amount,
        subtitle: `${e.paymentMethod}${e.notes ? ` • ${e.notes}` : ""}`,
      });
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [timeframe, yearlyIncomes, yearlyExpenses, incomes, expenses]);

  // ---------------------------------------------------------------------------
  // 4. CSV UTILITIES & DOWNLOADERS
  // ---------------------------------------------------------------------------
  const escapeCell = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

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

  // ---------------------------------------------------------------------------
  // 5. MONTHLY CSV EXPORTS
  // ---------------------------------------------------------------------------
  const handleExportMonthlyFullReport = () => {
    const lines: string[] = [];
    lines.push("================================================================================");
    lines.push(`MONTHLY FINANCIAL SUMMARY & TRENDS REPORT - ${monthName.toUpperCase()}`);
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

  const handleExportMonthlyTrendsOnly = () => {
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

  const handleExportMonthlyBudgetsOnly = () => {
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

  const handleExportMonthlyTransactionsOnly = () => {
    const lines: string[] = [];
    lines.push(`ITEMIZED TRANSACTIONS LEDGER - ${monthName.toUpperCase()}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push("");
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

  // ---------------------------------------------------------------------------
  // 6. YEARLY CSV EXPORTS (NEW)
  // ---------------------------------------------------------------------------

  // Comprehensive Annual Financial Report CSV
  const handleExportYearlyFullReport = () => {
    const lines: string[] = [];
    lines.push("================================================================================");
    lines.push(`ANNUAL COMPREHENSIVE FINANCIAL REPORT - YEAR ${selectedYear}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Total Transactions: ${yearlyIncomes.length + yearlyExpenses.length} (${yearlyIncomes.length} Incomes, ${yearlyExpenses.length} Expenses)`);
    lines.push(`Active Months with Activity: ${activeMonthsCount} / 12 Months`);
    lines.push("================================================================================");
    lines.push("");

    // Section 1: Executive Annual KPI Summary
    lines.push("--- 1. EXECUTIVE ANNUAL FINANCIAL SUMMARY ---");
    lines.push("Metric,Amount (₹),Percentage / Ratio,Annual Performance Notes");
    lines.push(`Total Annual Inflow (Income),${yearlyTotalIncome.toFixed(2)},100.0%,All recorded income channels across ${selectedYear}`);
    lines.push(`Total Annual Outflow (Expenses),${yearlyTotalExpenses.toFixed(2)},${yearlyTotalIncome > 0 ? ((yearlyTotalExpenses / yearlyTotalIncome) * 100).toFixed(1) : 0}%,All recorded expenditures across ${selectedYear}`);
    lines.push(`Net Annual Savings / Cashflow,${yearlyNetSavings.toFixed(2)},${yearlySavingsRate.toFixed(1)}%,${yearlyNetSavings >= 0 ? "Positive Net Annual Savings Surplus" : "Annual Net Deficit / Overspend"}`);
    lines.push(`Annual Savings Rate,${yearlySavingsRate.toFixed(1)}%,-,Net annual savings divided by total annual income`);
    const monthlyAvgIncome = activeMonthsCount > 0 ? yearlyTotalIncome / activeMonthsCount : yearlyTotalIncome / 12;
    const monthlyAvgExpense = activeMonthsCount > 0 ? yearlyTotalExpenses / activeMonthsCount : yearlyTotalExpenses / 12;
    lines.push(`Average Monthly Inflow,${monthlyAvgIncome.toFixed(2)},-,Calculated across ${activeMonthsCount || 12} active month(s)`);
    lines.push(`Average Monthly Outflow,${monthlyAvgExpense.toFixed(2)},-,Calculated across ${activeMonthsCount || 12} active month(s)`);
    lines.push("");

    // Section 2: 12-Month Cashflow Breakdown
    lines.push("--- 2. 12-MONTH ANNUAL CASHFLOW PERFORMANCE (JAN - DEC) ---");
    lines.push("Month,Full Month Name,Inflow / Income (₹),Outflow / Expenses (₹),Net Monthly Savings (₹),Savings Rate (%),Transaction Count,Monthly Health Status");
    monthlyCashflow12.forEach((m) => {
      const status = m.NetSavings > 0 ? "SURPLUS" : m.NetSavings < 0 ? "DEFICIT" : m.hasActivity ? "BREAK-EVEN" : "NO ACTIVITY";
      lines.push([
        escapeCell(m.month),
        escapeCell(m.fullName),
        m.Income.toFixed(2),
        m.Expenses.toFixed(2),
        m.NetSavings.toFixed(2),
        `${m.SavingsRate}%`,
        m.transactionCount,
        escapeCell(status),
      ].join(","));
    });
    lines.push("");

    // Section 3: Annual Category Expense Distribution
    lines.push("--- 3. ANNUAL EXPENSE CATEGORIES BREAKDOWN ---");
    lines.push("Expense Category,Total Annual Spent (₹),Share of Total Outflow (%),Average Monthly Spend (₹)");
    if (yearlyCategoryData.length > 0) {
      yearlyCategoryData.forEach((c) => {
        lines.push([
          escapeCell(c.name),
          c.value.toFixed(2),
          `${c.percentage.toFixed(1)}%`,
          c.monthlyAvg.toFixed(2),
        ].join(","));
      });
    } else {
      lines.push("No expenses recorded for this year");
    }
    lines.push("");

    // Section 4: Annual Income Sources Distribution
    lines.push("--- 4. ANNUAL INCOME SOURCES BREAKDOWN ---");
    lines.push("Income Source,Total Annual Earned (₹),Share of Total Inflow (%)");
    if (yearlyIncomeSourcesData.length > 0) {
      yearlyIncomeSourcesData.forEach((s) => {
        lines.push([
          escapeCell(s.source),
          s.amount.toFixed(2),
          `${s.percentage.toFixed(1)}%`,
        ].join(","));
      });
    } else {
      lines.push("No income recorded for this year");
    }
    lines.push("");

    // Section 5: Itemized Annual Ledger (Sorted chronologically)
    lines.push("--- 5. ITEMIZED ANNUAL TRANSACTION LEDGER ---");
    lines.push("ID,Date,Month,Type,Category / Source,Amount (₹),Payment Method / Recurring,Notes");
    
    // Combine and sort yearly entries
    const allYearlyEntries = [
      ...yearlyIncomes.map((i) => ({
        id: i.id,
        date: i.date,
        month: i.date.substring(0, 7),
        type: "Income",
        name: i.source,
        amount: i.amount,
        meta: i.isRecurring ? "Recurring" : "One-off",
        notes: i.notes || "",
      })),
      ...yearlyExpenses.map((e) => ({
        id: e.id,
        date: e.date,
        month: e.date.substring(0, 7),
        type: "Expense",
        name: e.category,
        amount: e.amount,
        meta: e.paymentMethod,
        notes: e.notes || "",
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (allYearlyEntries.length > 0) {
      allYearlyEntries.forEach((item) => {
        lines.push([
          escapeCell(item.id),
          item.date,
          item.month,
          item.type,
          escapeCell(item.name),
          item.amount.toFixed(2),
          escapeCell(item.meta),
          escapeCell(item.notes),
        ].join(","));
      });
    } else {
      lines.push("No transactions found for this year");
    }

    triggerDownload(`Comprehensive_Yearly_Financial_Report_${selectedYear}.csv`, lines.join("\r\n"));
    setShowExportModal(false);
  };

  // Yearly 12-Month Monthly Cashflow Table CSV Only
  const handleExportYearlyMonthlyCashflowOnly = () => {
    const lines: string[] = [];
    lines.push(`YEARLY 12-MONTH CASHFLOW PERFORMANCE - ${selectedYear}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push("Month Code,Month Name,Inflow / Income (₹),Outflow / Expense (₹),Net Cashflow (₹),Cumulative Net Buffer (₹),Savings Rate (%),Status");
    
    monthlyCashflow12.forEach((m) => {
      const status = m.NetSavings > 0 ? "SURPLUS" : m.NetSavings < 0 ? "DEFICIT" : m.hasActivity ? "BREAK-EVEN" : "NO ACTIVITY";
      lines.push([
        escapeCell(m.monthKey),
        escapeCell(m.fullName),
        m.Income.toFixed(2),
        m.Expenses.toFixed(2),
        m.NetSavings.toFixed(2),
        m.CumulativeNet.toFixed(2),
        `${m.SavingsRate}%`,
        escapeCell(status),
      ].join(","));
    });

    triggerDownload(`Yearly_12_Month_Cashflow_${selectedYear}.csv`, lines.join("\r\n"));
    setShowExportModal(false);
  };

  // Yearly Category Spending Only CSV
  const handleExportYearlyCategoriesOnly = () => {
    const lines: string[] = [];
    lines.push(`ANNUAL CATEGORY EXPENSE REPORT - YEAR ${selectedYear}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Total Annual Spend: ₹${yearlyTotalExpenses.toFixed(2)}`);
    lines.push("");
    lines.push("Rank,Category,Annual Spent (₹),Share of Total Spend (%),Average Monthly Spend (₹)");
    
    yearlyCategoryData.forEach((c, idx) => {
      lines.push([
        idx + 1,
        escapeCell(c.name),
        c.value.toFixed(2),
        `${c.percentage.toFixed(1)}%`,
        c.monthlyAvg.toFixed(2),
      ].join(","));
    });

    triggerDownload(`Yearly_Category_Spending_${selectedYear}.csv`, lines.join("\r\n"));
    setShowExportModal(false);
  };

  // Yearly Itemized Transactions Ledger CSV
  const handleExportYearlyTransactionsOnly = () => {
    const lines: string[] = [];
    lines.push(`ANNUAL ITEMIZED TRANSACTION LEDGER - YEAR ${selectedYear}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push("Type,ID,Date,Category / Source,Amount (₹),Payment Method / Recurring,Notes");
    
    yearlyIncomes.forEach((i) => {
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

    yearlyExpenses.forEach((e) => {
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

    triggerDownload(`Yearly_Itemized_Transactions_${selectedYear}.csv`, lines.join("\r\n"));
    setShowExportModal(false);
  };

  // Cycle year handler
  const handlePrevYear = () => {
    setSelectedYear((prev) => String(Number(prev) - 1));
  };
  const handleNextYear = () => {
    setSelectedYear((prev) => String(Number(prev) + 1));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ======================================================================= */}
      {/* HEADER BANNER WITH TIMEFRAME SWITCHER & EXPORT CONTROLS                 */}
      {/* ======================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#6B5A96] mb-1">
            <BarChart3 className="w-4 h-4 text-[#8E7BB5]" />
            <span>Financial Analytics &amp; Reports</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>{timeframe === "monthly" ? `Monthly Visuals (${monthName})` : `Yearly Financial Report (${selectedYear})`}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {timeframe === "monthly"
              ? `Visual spending trends, category proportions, and budget adherence for ${monthName}.`
              : `Comprehensive 12-month annual cashflow overview, category distributions, and yearly performance for ${selectedYear}.`}
          </p>
        </div>

        {/* Action Controls: Timeframe (Month vs Year) + Tab (Visuals vs Timeline) + Export CSV */}
        <div className="flex flex-nowrap items-center gap-2 shrink-0 overflow-x-auto max-w-full py-0.5">
          {/* 1. Timeframe Switcher: Monthly vs Yearly */}
          <div className="bg-[#FBF7F0] p-1 rounded-2xl border border-[#7ED4C9]/30 flex items-center shrink-0">
            <button
              id="timeframe-monthly-btn"
              onClick={() => {
                setTimeframe("monthly");
                setExportScope("month");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                timeframe === "monthly"
                  ? "bg-white text-[#358E85] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Monthly</span>
            </button>
            <button
              id="timeframe-yearly-btn"
              onClick={() => {
                setTimeframe("yearly");
                setExportScope("year");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                timeframe === "yearly"
                  ? "bg-white text-[#358E85] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Yearly</span>
            </button>
          </div>

          {/* If in Yearly view, show Year Selector pills */}
          {timeframe === "yearly" && (
            <div className="flex items-center gap-1 bg-white border border-[#7ED4C9]/40 rounded-2xl px-2 py-1 shadow-2xs shrink-0 whitespace-nowrap">
              <button
                onClick={handlePrevYear}
                className="p-1 hover:bg-[#FBF7F0] text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer shrink-0"
                title="Previous Year"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-xs font-black text-slate-800 bg-transparent border-0 focus:ring-0 cursor-pointer px-1 py-0.5 shrink-0"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
              <button
                onClick={handleNextYear}
                className="p-1 hover:bg-[#FBF7F0] text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer shrink-0"
                title="Next Year"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 2. Visuals vs Timeline toggle */}
          <div className="bg-[#FBF7F0] p-1 rounded-2xl border border-[#7ED4C9]/30 flex items-center shrink-0">
            <button
              onClick={() => setReportTab("visuals")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                reportTab === "visuals"
                  ? "bg-white text-[#358E85] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Charts
            </button>
            <button
              onClick={() => setReportTab("timeline")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                reportTab === "timeline"
                  ? "bg-white text-[#358E85] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Timeline
            </button>
          </div>

          {/* 3. Export CSV button */}
          <button
            id="export-csv-btn"
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#FF9A8B] to-[#FFB7A5] hover:from-[#F38573] hover:to-[#FF9A8B] text-slate-900 rounded-2xl text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer border border-[#FF9A8B]/60 shrink-0 whitespace-nowrap"
            title="Export Financial Summary & Trends as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-900" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* TAB CONTENT: VISUAL CHARTS OR HISTORICAL TIMELINE                      */}
      {/* ======================================================================= */}
      {reportTab === "visuals" ? (
        timeframe === "yearly" ? (
          /* ------------------------------------------------------------------- */
          /* YEARLY VISUAL DASHBOARD                                             */
          /* ------------------------------------------------------------------- */
          <div className="space-y-6">
            {/* Yearly Executive KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#7ED4C9]/40 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Annual Inflow</span>
                  <div className="p-2 bg-[#7ED4C9]/20 text-[#358E85] rounded-xl">
                    <ArrowDownCircle className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-[#358E85] mt-2">
                  ₹{yearlyTotalIncome.toFixed(2)}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  {yearlyIncomes.length} recorded income entry(s)
                </p>
              </div>

              <div className="bg-white border border-[#FFB7A5]/40 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Annual Outflow</span>
                  <div className="p-2 bg-[#FFB7A5]/25 text-[#E07A5F] rounded-xl">
                    <ArrowUpCircle className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-[#E07A5F] mt-2">
                  ₹{yearlyTotalExpenses.toFixed(2)}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  {yearlyExpenses.length} recorded expense item(s)
                </p>
              </div>

              <div className="bg-white border border-[#C6B9E0]/40 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Net Annual Savings</span>
                  <div className="p-2 bg-[#C6B9E0]/25 text-[#6B5A96] rounded-xl">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <h3 className={`text-xl font-black mt-2 ${yearlyNetSavings >= 0 ? "text-[#358E85]" : "text-[#E07A5F]"}`}>
                  ₹{yearlyNetSavings.toFixed(2)}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  {yearlyNetSavings >= 0 ? "Annual net cashflow surplus" : "Annual net deficit"}
                </p>
              </div>

              <div className="bg-white border border-[#7ED4C9]/40 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Annual Savings Rate</span>
                  <div className="p-2 bg-[#7ED4C9]/20 text-[#358E85] rounded-xl">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-[#358E85] mt-2">
                  {yearlySavingsRate}%
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  {activeMonthsCount} active month(s) in {selectedYear}
                </p>
              </div>
            </div>

            {/* Top Grid: 12-Month Cashflow Bar Chart + Category Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: 12-Month Inflow vs Outflow Bar Chart */}
              <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">12-Month Cashflow Trajectory ({selectedYear})</h3>
                    <p className="text-[11px] text-slate-500">Monthly Inflow (Income) vs Outflow (Expenses)</p>
                  </div>
                  <span className="text-xs font-bold text-[#358E85]">
                    {activeMonthsCount} Active Months
                  </span>
                </div>

                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyCashflow12}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "12px", color: "#0f172a", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                        formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, ""]}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", color: "#475569" }} />
                      <Bar dataKey="Income" fill="#4AA89E" radius={[6, 6, 0, 0]} name="Income" />
                      <Bar dataKey="Expenses" fill="#FF9A8B" radius={[6, 6, 0, 0]} name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Annual Category Expense Breakdown Donut */}
              <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Annual Expense Category Distribution</h3>
                    <p className="text-[11px] text-slate-500">Yearly spending allocation across categories</p>
                  </div>
                  <span className="text-xs font-bold text-[#E07A5F]">
                    ₹{yearlyTotalExpenses.toFixed(2)} Total
                  </span>
                </div>

                {yearlyCategoryData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                    No expense entries recorded for {selectedYear}.
                  </div>
                ) : (
                  <div className="h-64 w-full flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={yearlyCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {yearlyCategoryData.map((entry, index) => (
                            <Cell key={`yearly-cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "12px", color: "#0f172a", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                          formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, "Annual Spend"]}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", color: "#475569" }} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Chart 3: Cumulative Net Savings Growth Area Chart */}
            <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">12-Month Cumulative Net Savings Growth</h3>
                  <p className="text-[11px] text-slate-500">Running accumulation of net savings throughout {selectedYear}</p>
                </div>
                <span className={`text-xs font-bold ${yearlyNetSavings >= 0 ? "text-[#358E85]" : "text-[#E07A5F]"}`}>
                  ₹{yearlyNetSavings.toFixed(2)} Net Year-End
                </span>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyCashflow12}>
                    <defs>
                      <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7ED4C9" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#7ED4C9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₹${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "12px", color: "#0f172a", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, ""]}
                    />
                    <Area type="monotone" dataKey="CumulativeNet" stroke="#358E85" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCumulative)" name="Cumulative Net Buffer" />
                    <Line type="monotone" dataKey="NetSavings" stroke="#FF9A8B" strokeWidth={2} dot={true} name="Monthly Net Savings" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Yearly Table: 12-Month Breakdown Matrix */}
            <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Month-by-Month Annual Financial Performance</h3>
                  <p className="text-[11px] text-slate-500">Summary table for January through December {selectedYear}</p>
                </div>
                <button
                  onClick={handleExportYearlyMonthlyCashflowOnly}
                  className="flex items-center gap-1 text-xs font-bold text-[#358E85] hover:text-[#23635D] transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Table CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#7ED4C9]/30 text-slate-500 font-bold bg-[#FBF7F0]/60">
                      <th className="py-2.5 px-3 rounded-l-xl">Month</th>
                      <th className="py-2.5 px-3">Inflow (₹)</th>
                      <th className="py-2.5 px-3">Outflow (₹)</th>
                      <th className="py-2.5 px-3">Net Cashflow (₹)</th>
                      <th className="py-2.5 px-3">Savings Rate</th>
                      <th className="py-2.5 px-3 rounded-r-xl">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlyCashflow12.map((m) => (
                      <tr key={m.monthKey} className="hover:bg-[#FBF7F0]/40 transition-colors">
                        <td className="py-2.5 px-3 font-extrabold text-slate-800">
                          {m.fullName}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#358E85]">
                          ₹{m.Income.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#E07A5F]">
                          ₹{m.Expenses.toFixed(2)}
                        </td>
                        <td className={`py-2.5 px-3 font-bold ${m.NetSavings >= 0 ? "text-[#358E85]" : "text-[#E07A5F]"}`}>
                          {m.NetSavings >= 0 ? "+" : ""}₹{m.NetSavings.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-600">
                          {m.SavingsRate}%
                        </td>
                        <td className="py-2.5 px-3">
                          {m.NetSavings > 0 ? (
                            <span className="px-2 py-0.5 bg-[#7ED4C9]/25 text-[#2B756E] rounded-full text-[10px] font-extrabold">
                              Surplus
                            </span>
                          ) : m.NetSavings < 0 ? (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-extrabold">
                              Deficit
                            </span>
                          ) : m.hasActivity ? (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">
                              Break-Even
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">
                              No Activity
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------------- */
          /* MONTHLY VISUAL DASHBOARD                                            */
          /* ------------------------------------------------------------------- */
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
        )
      ) : (
        /* ------------------------------------------------------------------- */
        /* HISTORICAL ACTIVITY TIMELINE                                       */
        /* ------------------------------------------------------------------- */
        <div className="bg-white border border-[#7ED4C9]/35 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#7ED4C9]/20 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Historical Activity Timeline ({timeframe === "yearly" ? `Full Year ${selectedYear}` : monthName})
              </h3>
              <p className="text-[11px] text-slate-500">
                All financial income and expense transactions in chronological sequence
              </p>
            </div>
            <span className="text-xs text-slate-500 font-bold">{timelineEvents.length} Total Entries</span>
          </div>

          {timelineEvents.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No historical income or expense entries recorded for this period.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#7ED4C9]/30">
              {timelineEvents.map((event) => {
                const isInc = event.type === "income";

                return (
                  <div key={event.id} className="relative group">
                    <div className={`absolute -left-[27px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white ${
                      isInc ? "bg-[#4AA89E]" : "bg-[#FF9A8B]"
                    }`} />

                    <div className="p-4 rounded-2xl bg-[#FBF7F0]/60 border border-[#7ED4C9]/30 hover:border-[#4AA89E]/50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          isInc ? "bg-[#7ED4C9]/20 text-[#358E85]" : "bg-[#FFB7A5]/25 text-[#E07A5F]"
                        }`}>
                          {isInc ? <ArrowDownCircle className="w-4 h-4" /> : <ArrowUpCircle className="w-4 h-4" />}
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

      {/* ======================================================================= */}
      {/* EXPORT CSV MODAL (MONTHLY & YEARLY COMPREHENSIVE REPORTS)               */}
      {/* ======================================================================= */}
      {showExportModal && (
        <div 
          id="export-csv-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-csv-title"
        >
          <div className="bg-white border border-[#7ED4C9]/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#7ED4C9]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#C6B9E0]/25 text-[#6B5A96] rounded-2xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="export-csv-title" className="text-base font-extrabold text-slate-900">
                    Export Financial CSV Reports
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Download detailed spreadsheets for monthly tracking or annual review.
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

            {/* Scope Selection Tabs: Month vs Year */}
            <div className="flex items-center justify-between p-1.5 bg-[#FBF7F0] rounded-2xl border border-[#7ED4C9]/30">
              <button
                id="export-scope-year-btn"
                onClick={() => setExportScope("year")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  exportScope === "year"
                    ? "bg-white text-[#358E85] shadow-xs border border-[#7ED4C9]/40"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <CalendarDays className="w-4 h-4 text-[#358E85]" />
                <span>Full Year ({selectedYear}) CSV</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#7ED4C9]/20 text-[#358E85] rounded-md font-black">
                  NEW
                </span>
              </button>
              <button
                id="export-scope-month-btn"
                onClick={() => setExportScope("month")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  exportScope === "month"
                    ? "bg-white text-[#358E85] shadow-xs border border-[#7ED4C9]/40"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Calendar className="w-4 h-4 text-[#6B5A96]" />
                <span>Current Month ({monthName})</span>
              </button>
            </div>

            {/* --------------------------------------------------------------- */}
            {/* YEARLY EXPORT OPTIONS                                           */}
            {/* --------------------------------------------------------------- */}
            {exportScope === "year" ? (
              <div className="space-y-4">
                {/* Recommended Yearly Option */}
                <div className="bg-[#FBF7F0] border border-[#7ED4C9]/40 rounded-2xl p-4.5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Comprehensive Annual Financial Report ({selectedYear})
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[#7ED4C9]/30 text-[#358E85] rounded-full">
                          Full Year
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Includes all 5 sections for {selectedYear}: Executive Annual Summary, 12-Month Inflow/Outflow Breakdown (Jan–Dec), Category Proportions, Income Sources, and Full Itemized Transaction Ledger.
                      </p>
                    </div>
                  </div>

                  {/* Quick stats banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="bg-white border border-[#7ED4C9]/30 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-slate-500 font-medium">Annual Inflow</p>
                      <p className="text-xs font-bold text-[#358E85]">₹{yearlyTotalIncome.toFixed(0)}</p>
                    </div>
                    <div className="bg-white border border-[#FFB7A5]/35 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-slate-500 font-medium">Annual Outflow</p>
                      <p className="text-xs font-bold text-[#E07A5F]">₹{yearlyTotalExpenses.toFixed(0)}</p>
                    </div>
                    <div className="bg-white border border-[#C6B9E0]/35 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-slate-500 font-medium">Savings Rate</p>
                      <p className="text-xs font-bold text-[#6B5A96]">{yearlySavingsRate}%</p>
                    </div>
                    <div className="bg-white border border-[#7ED4C9]/30 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-slate-500 font-medium">Active Months</p>
                      <p className="text-xs font-bold text-slate-700">{activeMonthsCount} / 12</p>
                    </div>
                  </div>

                  <button
                    id="download-yearly-full-csv-btn"
                    onClick={handleExportYearlyFullReport}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#7ED4C9] to-[#4AA89E] hover:from-[#5BC0BE] hover:to-[#358E85] text-slate-900 text-xs font-extrabold rounded-2xl shadow-sm transition-all active:scale-[0.98] cursor-pointer border border-[#4AA89E]/40"
                  >
                    <Download className="w-4 h-4 text-slate-900" />
                    <span>Download Comprehensive Annual Report ({selectedYear} CSV)</span>
                  </button>
                </div>

                {/* Granular Yearly Datasets */}
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-slate-700">Or Download Targeted Yearly Sheets:</p>

                  {/* 12-Month Performance Table CSV */}
                  <button
                    id="download-yearly-cashflow-csv-btn"
                    onClick={handleExportYearlyMonthlyCashflowOnly}
                    className="w-full flex items-center justify-between p-3.5 bg-[#FBF7F0]/60 hover:bg-[#FBF7F0] border border-[#7ED4C9]/30 rounded-2xl transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#7ED4C9]/25 text-[#358E85] rounded-xl group-hover:scale-105 transition-transform">
                        <Table className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">12-Month Performance Cashflow Matrix (Jan - Dec)</p>
                        <p className="text-[11px] text-slate-500">Month-by-month Income, Outflow, Net Savings, and Savings Rate %.</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0 ml-2" />
                  </button>

                  {/* Annual Categories Breakdown CSV */}
                  <button
                    id="download-yearly-categories-csv-btn"
                    onClick={handleExportYearlyCategoriesOnly}
                    className="w-full flex items-center justify-between p-3.5 bg-[#FBF7F0]/60 hover:bg-[#FBF7F0] border border-[#7ED4C9]/30 rounded-2xl transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#FFB7A5]/30 text-[#E07A5F] rounded-xl group-hover:scale-105 transition-transform">
                        <PieIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Annual Category Expenses &amp; Monthly Averages</p>
                        <p className="text-[11px] text-slate-500">Yearly spending grouped by category with proportion % and monthly run-rate.</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0 ml-2" />
                  </button>

                  {/* Annual Itemized Transactions Ledger */}
                  <button
                    id="download-yearly-transactions-csv-btn"
                    onClick={handleExportYearlyTransactionsOnly}
                    className="w-full flex items-center justify-between p-3.5 bg-[#FBF7F0]/60 hover:bg-[#FBF7F0] border border-[#7ED4C9]/30 rounded-2xl transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#C6B9E0]/25 text-[#6B5A96] rounded-xl group-hover:scale-105 transition-transform">
                        <FileDown className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Annual Itemized Transaction Ledger</p>
                        <p className="text-[11px] text-slate-500">All recorded incomes and expenses throughout {selectedYear} for tax and accounting.</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0 ml-2" />
                  </button>
                </div>
              </div>
            ) : (
              /* --------------------------------------------------------------- */
              /* MONTHLY EXPORT OPTIONS                                          */
              /* --------------------------------------------------------------- */
              <div className="space-y-4">
                {/* Primary Option: Comprehensive Monthly Report */}
                <div className="bg-[#FBF7F0] border border-[#7ED4C9]/40 rounded-2xl p-4.5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Comprehensive Monthly Financial Report</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[#7ED4C9]/30 text-[#358E85] rounded-full">
                          Month
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Includes all 5 monthly sections: Executive KPIs, Category Breakdown &amp; Budgets, Daily Inflow/Outflow Trends, and Itemized Logs for {monthName}.
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
                    id="download-monthly-full-csv-btn"
                    onClick={handleExportMonthlyFullReport}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#7ED4C9] to-[#4AA89E] hover:from-[#5BC0BE] hover:to-[#358E85] text-slate-900 text-xs font-extrabold rounded-2xl shadow-sm transition-all active:scale-[0.98] cursor-pointer border border-[#4AA89E]/40"
                  >
                    <Download className="w-4 h-4 text-slate-900" />
                    <span>Download Monthly Report ({selectedMonth} CSV)</span>
                  </button>
                </div>

                {/* Granular Monthly Export Options */}
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-slate-700">Or Export Specific Datasets:</p>

                  <button
                    id="download-trends-csv-btn"
                    onClick={handleExportMonthlyTrendsOnly}
                    className="w-full flex items-center justify-between p-3.5 bg-[#FBF7F0]/60 hover:bg-[#FBF7F0] border border-[#7ED4C9]/30 rounded-2xl transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#FFB7A5]/30 text-[#E07A5F] rounded-xl group-hover:scale-105 transition-transform">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Daily Spending Trends &amp; Cumulative Trajectory</p>
                        <p className="text-[11px] text-slate-500">Day-by-day daily spend, income, net flow, and cumulative burn rate.</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0 ml-2" />
                  </button>

                  <button
                    id="download-budgets-csv-btn"
                    onClick={handleExportMonthlyBudgetsOnly}
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

                  <button
                    id="download-transactions-csv-btn"
                    onClick={handleExportMonthlyTransactionsOnly}
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
              </div>
            )}

            {/* Privacy & BOM Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[#7ED4C9]/20 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-[#358E85]" />
                Client-side generation with UTF-8 BOM encoding (Excel &amp; Sheets compatible)
              </span>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

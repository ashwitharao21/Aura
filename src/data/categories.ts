import { 
  Briefcase, 
  Laptop, 
  TrendingUp, 
  Building, 
  Home, 
  Gift, 
  RotateCcw, 
  MoreHorizontal,
  Utensils,
  ShoppingBag,
  Zap,
  Car,
  HeartPulse,
  Film,
  GraduationCap,
  Sparkles,
  Tv,
  Plane,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet
} from "lucide-react";
import { ExpenseCategory, IncomeSource, PaymentMethod } from "../types";

export interface CategoryMeta {
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const INCOME_SOURCES: Array<{ name: IncomeSource; icon: any; color: string; bgColor: string }> = [
  { name: "Salary", icon: Briefcase, color: "text-[#4AA89E]", bgColor: "bg-[#7ED4C9]/15" },
  { name: "Freelance", icon: Laptop, color: "text-[#5BC0BE]", bgColor: "bg-[#7ED4C9]/20" },
  { name: "Investments", icon: TrendingUp, color: "text-[#8E7BB5]", bgColor: "bg-[#C6B9E0]/20" },
  { name: "Business", icon: Building, color: "text-[#4AA89E]", bgColor: "bg-[#B3E5DF]/30" },
  { name: "Rental", icon: Home, color: "text-[#E07A5F]", bgColor: "bg-[#FFB7A5]/20" },
  { name: "Gifts", icon: Gift, color: "text-[#D87D8E]", bgColor: "bg-[#FFB7A5]/25" },
  { name: "Refunds", icon: RotateCcw, color: "text-[#5EA8A7]", bgColor: "bg-[#7ED4C9]/15" },
  { name: "Other", icon: MoreHorizontal, color: "text-slate-600", bgColor: "bg-slate-100" },
];

export const EXPENSE_CATEGORIES: Array<{ name: ExpenseCategory; icon: any; color: string; bgColor: string; chartColor: string }> = [
  { name: "Housing & Rent", icon: Home, color: "text-[#4AA89E]", bgColor: "bg-[#7ED4C9]/15", chartColor: "#4AA89E" },
  { name: "Groceries & Food", icon: ShoppingBag, color: "text-[#3D9E94]", bgColor: "bg-[#B3E5DF]/30", chartColor: "#7ED4C9" },
  { name: "Dining Out", icon: Utensils, color: "text-[#E27D60]", bgColor: "bg-[#FFB7A5]/20", chartColor: "#FFB7A5" },
  { name: "Utilities & Bills", icon: Zap, color: "text-[#5BC0BE]", bgColor: "bg-[#7ED4C9]/20", chartColor: "#5BC0BE" },
  { name: "Transportation", icon: Car, color: "text-[#628395]", bgColor: "bg-slate-100", chartColor: "#628395" },
  { name: "Healthcare & Medical", icon: HeartPulse, color: "text-[#D96B6B]", bgColor: "bg-[#FFB7A5]/15", chartColor: "#E0877A" },
  { name: "Entertainment & Leisure", icon: Film, color: "text-[#8E7BB5]", bgColor: "bg-[#C6B9E0]/20", chartColor: "#C6B9E0" },
  { name: "Shopping & Apparel", icon: Sparkles, color: "text-[#E07A5F]", bgColor: "bg-[#FFB7A5]/25", chartColor: "#FF9A8B" },
  { name: "Education", icon: GraduationCap, color: "text-[#7A6B99]", bgColor: "bg-[#C6B9E0]/25", chartColor: "#9D88C7" },
  { name: "Personal Care", icon: Sparkles, color: "text-[#4AA89E]", bgColor: "bg-[#7ED4C9]/15", chartColor: "#52B788" },
  { name: "Subscriptions", icon: Tv, color: "text-[#8E7BB5]", bgColor: "bg-[#C6B9E0]/20", chartColor: "#B5A7D6" },
  { name: "Travel", icon: Plane, color: "text-[#3D9E94]", bgColor: "bg-[#B3E5DF]/25", chartColor: "#B3E5DF" },
  { name: "Gifts & Donations", icon: Gift, color: "text-[#E07A5F]", bgColor: "bg-[#FFB7A5]/20", chartColor: "#FFC6B8" },
  { name: "Miscellaneous", icon: MoreHorizontal, color: "text-slate-600", bgColor: "bg-slate-100", chartColor: "#94A3B8" },
];

export const PAYMENT_METHODS: Array<{ name: PaymentMethod; icon: any }> = [
  { name: "Credit Card", icon: CreditCard },
  { name: "Debit Card", icon: CreditCard },
  { name: "Cash", icon: Banknote },
  { name: "Bank Transfer", icon: Building },
  { name: "Digital Wallet / UPI", icon: Smartphone },
  { name: "Other", icon: Wallet },
];

export function getCategoryMeta(categoryName: string) {
  const match = EXPENSE_CATEGORIES.find(c => c.name === categoryName);
  if (match) return match;
  return {
    name: categoryName,
    icon: MoreHorizontal,
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    chartColor: "#64748b",
  };
}

export function getIncomeSourceMeta(sourceName: string) {
  const match = INCOME_SOURCES.find(s => s.name === sourceName);
  if (match) return match;
  return {
    name: sourceName,
    icon: MoreHorizontal,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  };
}

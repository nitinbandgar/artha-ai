import { TRANSACTIONS, UPCOMING_BILLS, getCategoryBreakdown, getMonthlySpending } from "@/lib/mock-data";
import { formatCurrency, formatDateShort, getDaysUntil } from "@/lib/utils";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Bell, ChevronRight, Scissors, ShieldCheck, Lightbulb, Zap } from "lucide-react";

export default function Dashboard() {
  const thisMonth = "2026-05";
  const lastMonth = "2026-04";
  const spent = getMonthlySpending(thisMonth);
  const lastSpent = getMonthlySpending(lastMonth);
  const diff = ((spent - lastSpent) / lastSpent * 100).toFixed(0);
  const categories = getCategoryBreakdown(thisMonth).slice(0, 4);
  const recent = TRANSACTIONS.slice(0, 5);
  const upcomingBills = UPCOMING_BILLS.slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Good morning,</p>
          <h1 className="text-2xl font-bold text-gray-900">Nitin 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-xl bg-white border border-gray-100 shadow-sm">
            <Bell size={18} className="text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">N</div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-5 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-10 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Zap size={16} className="text-indigo-300" />
              <span className="text-indigo-200 text-sm font-medium">UPI Balance</span>
            </div>
            <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">nitin@okicici</span>
          </div>
          <p className="text-4xl font-bold mb-1">₹38,450</p>
          <p className="text-indigo-200 text-sm">Available balance</p>
          <div className="mt-4 pt-4 border-t border-white/20 flex gap-6">
            <div>
              <p className="text-indigo-300 text-xs">Spent this month</p>
              <p className="text-white font-semibold">{formatCurrency(spent)}</p>
            </div>
            <div>
              <p className="text-indigo-300 text-xs">vs last month</p>
              <p className={`font-semibold ${Number(diff) > 0 ? "text-red-300" : "text-green-300"}`}>
                {Number(diff) > 0 ? "▲" : "▼"} {Math.abs(Number(diff))}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/split" className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <Scissors size={18} className="text-violet-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Smart Split</span>
        </Link>
        <Link href="/insights" className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Lightbulb size={18} className="text-amber-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">AI Insights</span>
        </Link>
        <Link href="/fraud" className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <ShieldCheck size={18} className="text-green-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Fraud Guard</span>
        </Link>
      </div>

      {/* AI Nudge Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl">🤖</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-900">AI Weekly Digest</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            You&apos;ve spent 34% more on food this week vs your monthly average. Swiggy + Zomato = ₹3,340. Your electricity bill is due in 21 days.
          </p>
        </div>
        <Link href="/insights" className="shrink-0 text-amber-600">
          <ChevronRight size={18} />
        </Link>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">May Spending</h2>
          <Link href="/transactions" className="text-xs text-indigo-600 font-medium flex items-center gap-0.5">
            All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="space-y-2.5">
          {categories.map(cat => {
            const pct = Math.round((cat.value / spent) * 100);
            return (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-sm text-gray-700">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{pct}%</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(cat.value)}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Bills */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Upcoming Bills</h2>
          <Link href="/insights" className="text-xs text-indigo-600 font-medium flex items-center gap-0.5">
            All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {upcomingBills.map(bill => {
            const days = getDaysUntil(bill.dueDate);
            const urgent = days <= 7;
            return (
              <div key={bill.name} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${urgent ? "bg-red-50" : "bg-gray-50"}`}>
                  {bill.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{bill.name}</p>
                  <p className={`text-xs ${urgent ? "text-red-500 font-medium" : "text-gray-400"}`}>
                    Due in {days} days · {formatDateShort(bill.dueDate)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(bill.amount)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
          <Link href="/transactions" className="text-xs text-indigo-600 font-medium flex items-center gap-0.5">
            See all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {recent.map(txn => (
            <div key={txn.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg">
                {txn.type === "credit" ? "💰" : txn.category === "Food & Dining" ? "🍔" : txn.category === "Transport" ? "🚗" : txn.category === "Shopping" ? "🛍️" : txn.category === "Bills & Utilities" ? "⚡" : "💳"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{txn.merchant}</p>
                <p className="text-xs text-gray-400">{formatDateShort(txn.date)} · {txn.category}</p>
              </div>
              <div className={`flex items-center gap-0.5 text-sm font-semibold ${txn.type === "credit" ? "text-green-600" : "text-gray-900"}`}>
                {txn.type === "credit"
                  ? <ArrowDownLeft size={14} className="text-green-500" />
                  : <ArrowUpRight size={14} className="text-red-400" />
                }
                ₹{txn.amount.toLocaleString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NPCI Badge */}
      <div className="flex items-center justify-center gap-2 py-2">
        <span className="text-xs text-gray-400">Powered by UPI · NPCI</span>
        <div className="h-3 w-px bg-gray-200" />
        <span className="text-xs text-gray-400">#AIInDigitalPayments</span>
      </div>
    </div>
  );
}

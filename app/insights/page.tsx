"use client";
import { useState, useEffect } from "react";
import { getCategoryBreakdown, getMonthlySpending, UPCOMING_BILLS, TRANSACTIONS } from "@/lib/mock-data";
import { formatCurrency, formatDateShort, getDaysUntil } from "@/lib/utils";
import { Lightbulb, Loader2, RefreshCw, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function InsightsPage() {
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const categories = getCategoryBreakdown("2026-05");
  const thisMonthSpend = getMonthlySpending("2026-05");
  const lastMonthSpend = getMonthlySpending("2026-04");
  const diff = thisMonthSpend - lastMonthSpend;

  async function loadNarrative() {
    setLoading(true);
    try {
      const res = await fetch("/api/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: TRANSACTIONS.slice(0, 20),
          thisMonthSpend,
          lastMonthSpend,
          categories: categories.slice(0, 5),
          upcomingBills: UPCOMING_BILLS,
        }),
      });
      const data = await res.json();
      setNarrative(data.narrative);
      setLoaded(true);
    } catch {
      setNarrative("Unable to generate insights right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadNarrative(); }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your personalized financial story</p>
        </div>
        <button
          onClick={loadNarrative}
          disabled={loading}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Month Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            {diff > 0 ? <TrendingUp size={16} className="text-red-500" /> : <TrendingDown size={16} className="text-green-500" />}
            <span className="text-xs font-medium text-gray-500">vs Last Month</span>
          </div>
          <p className={`text-xl font-bold ${diff > 0 ? "text-red-600" : "text-green-600"}`}>
            {diff > 0 ? "+" : ""}{formatCurrency(Math.abs(diff))}
          </p>
          <p className="text-xs text-gray-400 mt-1">{diff > 0 ? "Over-spending" : "Under-spending"}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-indigo-500" />
            <span className="text-xs font-medium text-gray-500">May 2026</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(thisMonthSpend)}</p>
          <p className="text-xs text-gray-400 mt-1">Total spent so far</p>
        </div>
      </div>

      {/* AI Narrative */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Lightbulb size={14} className="text-white" />
          </div>
          <p className="font-semibold text-indigo-900">AI Financial Story</p>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-indigo-600">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Analyzing your spending patterns...</span>
          </div>
        ) : (
          <div className="text-sm text-indigo-800 leading-relaxed space-y-2">
            {narrative.split("\n").filter(l => l.trim()).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h2 className="font-semibold text-gray-900 mb-4">Spending Breakdown</h2>
        <div className="flex gap-4 items-center">
          <div className="w-36 h-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="value" cx="50%" cy="50%" innerRadius={32} outerRadius={62} paddingAngle={2}>
                  {categories.map((cat, i) => (
                    <Cell key={i} fill={cat.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {categories.slice(0, 5).map(cat => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-gray-600 flex-1 truncate">{cat.name}</span>
                <span className="text-xs font-semibold text-gray-900">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Bills */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Bill Predictions</h2>
        <p className="text-xs text-gray-500 mb-3">AI predicted from your payment history</p>
        <div className="space-y-3">
          {UPCOMING_BILLS.map(bill => {
            const days = getDaysUntil(bill.dueDate);
            const urgent = days <= 7;
            const soon = days <= 14;
            return (
              <div key={bill.name} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${urgent ? "bg-red-50" : soon ? "bg-amber-50" : "bg-gray-50"}`}>
                  {bill.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{bill.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                      urgent ? "bg-red-100 text-red-600" : soon ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {days}d · {formatDateShort(bill.dueDate)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(bill.amount)}</span>
                  <p className="text-xs text-gray-400">estimated</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 bg-indigo-50 rounded-xl p-3 text-xs text-indigo-700">
          💡 Total upcoming bills: <strong>{formatCurrency(UPCOMING_BILLS.reduce((s, b) => s + b.amount, 0))}</strong> — ensure your balance stays above this.
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Smart Money Tips</h2>
        <div className="space-y-2.5">
          {[
            { emoji: "🍔", tip: "Your food delivery spend is ₹3,340 this month. Cooking 2 meals/week could save ₹800+." },
            { emoji: "📱", tip: "You have 3 active OTT subscriptions. Consider a family plan to save ₹600/month." },
            { emoji: "💳", tip: "Your HDFC credit card bill of ₹12,000 is due June 25. Set a calendar reminder." },
            { emoji: "💰", tip: "You saved 0% this month. Even ₹2,000/month in a liquid fund grows to ₹24,000+/year." },
          ].map((t, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-xl shrink-0">{t.emoji}</span>
              <p className="text-sm text-gray-600 leading-relaxed">{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

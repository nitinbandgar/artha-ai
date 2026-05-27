"use client";
import { useState } from "react";
import { TRANSACTIONS, CATEGORIES, Transaction } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";

const EMOJI_MAP: Record<string, string> = {
  "Food & Dining": "🍔", "Transport": "🚗", "Shopping": "🛍️",
  "Bills & Utilities": "⚡", "Entertainment": "🎬", "Groceries": "🛒",
  "Health": "💊", "Travel": "✈️", "Transfer": "💸", "Income": "💰",
};

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = TRANSACTIONS.filter(t => {
    const matchSearch = t.merchant.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "All" || t.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const totalDebit = filtered.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);
  const totalCredit = filtered.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);

  const categories = ["All", ...Array.from(new Set(TRANSACTIONS.map(t => t.category)))];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-500 mt-0.5">{filtered.length} transactions found</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight size={16} className="text-red-500" />
            <span className="text-xs text-red-600 font-medium">Total Spent</span>
          </div>
          <p className="text-xl font-bold text-red-700">{formatCurrency(totalDebit)}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownLeft size={16} className="text-green-500" />
            <span className="text-xs text-green-600 font-medium">Total Received</span>
          </div>
          <p className="text-xl font-bold text-green-700">{formatCurrency(totalCredit)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search merchant or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {cat === "All" ? "All" : `${EMOJI_MAP[cat] || "💳"} ${cat}`}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No transactions found</div>
        ) : (
          filtered.map(txn => (
            <TransactionRow key={txn.id} txn={txn} />
          ))
        )}
      </div>
    </div>
  );
}

function TransactionRow({ txn }: { txn: Transaction }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg shrink-0">
        {EMOJI_MAP[txn.category] || "💳"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{txn.merchant}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-gray-400">{formatDate(txn.date)}</span>
          <span className="text-gray-300">·</span>
          <span className="text-xs text-gray-400 truncate">{txn.upiId}</span>
        </div>
        {txn.note && <p className="text-xs text-indigo-500 mt-0.5">{txn.note}</p>}
      </div>
      <div className="text-right shrink-0">
        <div className={`flex items-center gap-0.5 justify-end text-sm font-semibold ${txn.type === "credit" ? "text-green-600" : "text-gray-900"}`}>
          {txn.type === "credit"
            ? <ArrowDownLeft size={13} className="text-green-500" />
            : <ArrowUpRight size={13} className="text-red-400" />
          }
          ₹{txn.amount.toLocaleString("en-IN")}
        </div>
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
          txn.type === "credit" ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-500"
        }`}>
          {txn.category}
        </span>
      </div>
    </div>
  );
}

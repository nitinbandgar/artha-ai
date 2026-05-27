export type Transaction = {
  id: string;
  date: string;
  amount: number;
  type: "debit" | "credit";
  merchant: string;
  upiId: string;
  category: string;
  note?: string;
  status: "success" | "pending" | "failed";
};

export type Contact = {
  name: string;
  upiId: string;
  avatar: string;
};

export const CONTACTS: Contact[] = [
  { name: "Rahul Sharma", upiId: "rahul.sharma@okicici", avatar: "RS" },
  { name: "Priya Patel", upiId: "priya.patel@oksbi", avatar: "PP" },
  { name: "Arjun Mehta", upiId: "arjun.mehta@okaxis", avatar: "AM" },
  { name: "Sneha Gupta", upiId: "sneha.g@ybl", avatar: "SG" },
  { name: "Vikram Nair", upiId: "vikram.nair@okhdfc", avatar: "VN" },
];

const generateId = (i: number) => `txn_${String(i).padStart(5, "0")}`;

export const TRANSACTIONS: Transaction[] = [
  // May 2026
  { id: generateId(1), date: "2026-05-25", amount: 840, type: "debit", merchant: "Swiggy", upiId: "swiggy@icici", category: "Food & Dining", note: "Dinner order" },
  { id: generateId(2), date: "2026-05-24", amount: 299, type: "debit", merchant: "Netflix", upiId: "netflix@axisbank", category: "Entertainment" },
  { id: generateId(3), date: "2026-05-24", amount: 1200, type: "debit", merchant: "Uber", upiId: "uber@axisbank", category: "Transport" },
  { id: generateId(4), date: "2026-05-23", amount: 3450, type: "debit", merchant: "BigBasket", upiId: "bigbasket@okicici", category: "Groceries" },
  { id: generateId(5), date: "2026-05-22", amount: 500, type: "credit", merchant: "Rahul Sharma", upiId: "rahul.sharma@okicici", category: "Transfer", note: "Movie split" },
  { id: generateId(6), date: "2026-05-21", amount: 2100, type: "debit", merchant: "Zomato", upiId: "zomato@okaxis", category: "Food & Dining", note: "Team lunch" },
  { id: generateId(7), date: "2026-05-20", amount: 850, type: "debit", merchant: "Ola", upiId: "ola@axisbank", category: "Transport" },
  { id: generateId(8), date: "2026-05-19", amount: 15000, type: "credit", merchant: "Salary Credit", upiId: "corp@hdfcbank", category: "Income" },
  { id: generateId(9), date: "2026-05-18", amount: 1499, type: "debit", merchant: "Amazon Prime", upiId: "amazon@apl", category: "Entertainment" },
  { id: generateId(10), date: "2026-05-17", amount: 680, type: "debit", merchant: "Myntra", upiId: "myntra@ybl", category: "Shopping" },
  { id: generateId(11), date: "2026-05-16", amount: 2800, type: "debit", merchant: "BEST Electricity", upiId: "bestutility@okaxis", category: "Bills & Utilities" },
  { id: generateId(12), date: "2026-05-15", amount: 199, type: "debit", merchant: "Spotify", upiId: "spotify@axisbank", category: "Entertainment" },
  { id: generateId(13), date: "2026-05-14", amount: 560, type: "debit", merchant: "Swiggy", upiId: "swiggy@icici", category: "Food & Dining" },
  { id: generateId(14), date: "2026-05-13", amount: 450, type: "credit", merchant: "Priya Patel", upiId: "priya.patel@oksbi", category: "Transfer", note: "Grocery split" },
  { id: generateId(15), date: "2026-05-12", amount: 3200, type: "debit", merchant: "Reliance Digital", upiId: "reliancedigital@okicici", category: "Shopping" },
  { id: generateId(16), date: "2026-05-11", amount: 720, type: "debit", merchant: "PharmEasy", upiId: "pharmeasy@ybl", category: "Health" },
  { id: generateId(17), date: "2026-05-10", amount: 1100, type: "debit", merchant: "BookMyShow", upiId: "bookmyshow@okicici", category: "Entertainment", note: "Avengers tickets" },
  { id: generateId(18), date: "2026-05-09", amount: 4500, type: "debit", merchant: "Jio Postpaid", upiId: "jio@okaxis", category: "Bills & Utilities" },
  { id: generateId(19), date: "2026-05-08", amount: 380, type: "debit", merchant: "Zomato", upiId: "zomato@okaxis", category: "Food & Dining" },
  { id: generateId(20), date: "2026-05-07", amount: 250, type: "debit", merchant: "Rapido", upiId: "rapido@okicici", category: "Transport" },

  // April 2026
  { id: generateId(21), date: "2026-04-30", amount: 75000, type: "credit", merchant: "Salary Credit", upiId: "corp@hdfcbank", category: "Income" },
  { id: generateId(22), date: "2026-04-28", amount: 920, type: "debit", merchant: "Swiggy", upiId: "swiggy@icici", category: "Food & Dining" },
  { id: generateId(23), date: "2026-04-27", amount: 2400, type: "debit", merchant: "Uber", upiId: "uber@axisbank", category: "Transport" },
  { id: generateId(24), date: "2026-04-25", amount: 5800, type: "debit", merchant: "MakeMyTrip", upiId: "makemytrip@okicici", category: "Travel", note: "Goa trip flights" },
  { id: generateId(25), date: "2026-04-24", amount: 3100, type: "debit", merchant: "BigBasket", upiId: "bigbasket@okicici", category: "Groceries" },
  { id: generateId(26), date: "2026-04-22", amount: 1600, type: "credit", merchant: "Arjun Mehta", upiId: "arjun.mehta@okaxis", category: "Transfer", note: "Goa split" },
  { id: generateId(27), date: "2026-04-20", amount: 2700, type: "debit", merchant: "BEST Electricity", upiId: "bestutility@okaxis", category: "Bills & Utilities" },
  { id: generateId(28), date: "2026-04-18", amount: 1800, type: "debit", merchant: "Zomato", upiId: "zomato@okaxis", category: "Food & Dining" },
  { id: generateId(29), date: "2026-04-15", amount: 8500, type: "debit", merchant: "Meesho", upiId: "meesho@ybl", category: "Shopping" },
  { id: generateId(30), date: "2026-04-10", amount: 500, type: "debit", merchant: "Rapido", upiId: "rapido@okicici", category: "Transport" },

  // March 2026
  { id: generateId(31), date: "2026-03-31", amount: 75000, type: "credit", merchant: "Salary Credit", upiId: "corp@hdfcbank", category: "Income" },
  { id: generateId(32), date: "2026-03-28", amount: 1450, type: "debit", merchant: "Swiggy", upiId: "swiggy@icici", category: "Food & Dining" },
  { id: generateId(33), date: "2026-03-25", amount: 12000, type: "debit", merchant: "HDFC Credit Card", upiId: "hdfccc@okhdfc", category: "Bills & Utilities", note: "Credit card bill" },
  { id: generateId(34), date: "2026-03-22", amount: 3600, type: "debit", merchant: "Amazon", upiId: "amazon@apl", category: "Shopping" },
  { id: generateId(35), date: "2026-03-18", amount: 2200, type: "debit", merchant: "Zomato", upiId: "zomato@okaxis", category: "Food & Dining" },
  { id: generateId(36), date: "2026-03-15", amount: 2900, type: "debit", merchant: "BEST Electricity", upiId: "bestutility@okaxis", category: "Bills & Utilities" },
  { id: generateId(37), date: "2026-03-10", amount: 4200, type: "debit", merchant: "Nykaa", upiId: "nykaa@okicici", category: "Shopping" },
  { id: generateId(38), date: "2026-03-05", amount: 680, type: "debit", merchant: "Ola", upiId: "ola@axisbank", category: "Transport" },
].map(t => ({ ...t, status: "success" as const, type: t.type as "debit" | "credit" }));

export const CATEGORIES = [
  { name: "Food & Dining", color: "#f97316", icon: "🍔" },
  { name: "Transport", color: "#3b82f6", icon: "🚗" },
  { name: "Shopping", color: "#a855f7", icon: "🛍️" },
  { name: "Bills & Utilities", color: "#ef4444", icon: "⚡" },
  { name: "Entertainment", color: "#ec4899", icon: "🎬" },
  { name: "Groceries", color: "#22c55e", icon: "🛒" },
  { name: "Health", color: "#14b8a6", icon: "💊" },
  { name: "Travel", color: "#f59e0b", icon: "✈️" },
  { name: "Transfer", color: "#6366f1", icon: "💸" },
  { name: "Income", color: "#10b981", icon: "💰" },
];

export function getMonthlySpending(month: string) {
  return TRANSACTIONS.filter(
    t => t.date.startsWith(month) && t.type === "debit"
  ).reduce((sum, t) => sum + t.amount, 0);
}

export function getCategoryBreakdown(month: string) {
  const debits = TRANSACTIONS.filter(
    t => t.date.startsWith(month) && t.type === "debit"
  );
  const map: Record<string, number> = {};
  for (const t of debits) {
    map[t.category] = (map[t.category] || 0) + t.amount;
  }
  return Object.entries(map)
    .map(([name, value]) => {
      const cat = CATEGORIES.find(c => c.name === name);
      return { name, value, color: cat?.color || "#6366f1", icon: cat?.icon || "💳" };
    })
    .sort((a, b) => b.value - a.value);
}

export function getRecentTransactions(limit = 10) {
  return TRANSACTIONS.slice(0, limit);
}

export const UPCOMING_BILLS = [
  { name: "Jio Postpaid", amount: 4500, dueDate: "2026-06-09", category: "Bills & Utilities", icon: "📱" },
  { name: "BEST Electricity", amount: 2800, dueDate: "2026-06-16", category: "Bills & Utilities", icon: "⚡" },
  { name: "Netflix", amount: 299, dueDate: "2026-06-24", category: "Entertainment", icon: "🎬" },
  { name: "Amazon Prime", amount: 1499, dueDate: "2026-06-18", category: "Entertainment", icon: "📦" },
  { name: "HDFC Credit Card", amount: 12000, dueDate: "2026-06-25", category: "Bills & Utilities", icon: "💳" },
];

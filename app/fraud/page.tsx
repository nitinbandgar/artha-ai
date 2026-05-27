"use client";
import { useState } from "react";
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle2, XCircle, Shield } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

type RiskLevel = "low" | "medium" | "high";

type FraudResult = {
  riskLevel: RiskLevel;
  riskScore: number;
  summary: string;
  flags: string[];
  recommendation: string;
};

const EXAMPLE_PAYMENTS = [
  { label: "Known friend", upiId: "rahul.sharma@okicici", amount: "500", name: "Rahul Sharma" },
  { label: "Suspicious", upiId: "claim9944refund@paytm", amount: "1", name: "KBC Lottery" },
  { label: "Merchant", upiId: "swiggy@icici", amount: "320", name: "Swiggy" },
  { label: "OTP Scam", upiId: "verify.bank.secure@ybl", amount: "10", name: "Bank Verification" },
];

export default function FraudPage() {
  const { language } = useLanguage();
  const [form, setForm] = useState({ upiId: "", amount: "", name: "", note: "" });
  const [result, setResult] = useState<FraudResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    if (!form.upiId || !form.amount) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/fraud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, languageCode: language.code, languageLabel: language.label }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        riskLevel: "medium",
        riskScore: 50,
        summary: "Could not analyze payment. Proceed with caution.",
        flags: ["Analysis unavailable"],
        recommendation: "Verify the payee manually before sending.",
      });
    } finally {
      setLoading(false);
    }
  }

  function fill(example: typeof EXAMPLE_PAYMENTS[0]) {
    setForm({ upiId: example.upiId, amount: example.amount, name: example.name, note: "" });
    setResult(null);
  }

  const riskConfig = {
    low: { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: CheckCircle2, label: "Low Risk", bar: "bg-green-500" },
    medium: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle, label: "Medium Risk", bar: "bg-amber-500" },
    high: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: XCircle, label: "High Risk — Do Not Pay", bar: "bg-red-500" },
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
          <ShieldCheck size={16} className="text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fraud Guard</h1>
          <p className="text-xs text-gray-500">AI-powered UPI payment risk scanner</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Scams blocked in India", value: "₹1,470 Cr", sub: "FY2024" },
          { label: "UPI fraud cases", value: "13.42L", sub: "FY2024" },
          { label: "Avg scam amount", value: "₹10,900", sub: "per victim" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
            <p className="text-base font-bold text-red-600">{s.value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{s.label}</p>
            <p className="text-[10px] text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Check Before You Pay</h2>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">UPI ID *</label>
          <input
            type="text"
            placeholder="e.g. name@okicici or number@paytm"
            value={form.upiId}
            onChange={e => setForm(f => ({ ...f, upiId: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Amount (₹) *</label>
            <input
              type="number"
              placeholder="0"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Payee Name</label>
            <input
              type="text"
              placeholder="Optional"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Payment reason / note</label>
          <input
            type="text"
            placeholder="e.g. KBC lottery prize, OTP verification..."
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={check}
          disabled={loading || !form.upiId || !form.amount}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Shield size={16} /> Run AI Risk Scan</>}
        </button>
      </div>

      {/* Quick examples */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Try these examples:</p>
        <div className="grid grid-cols-2 gap-2">
          {EXAMPLE_PAYMENTS.map(ex => (
            <button
              key={ex.upiId}
              onClick={() => fill(ex)}
              className="text-left p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 transition-colors"
            >
              <p className="text-xs font-semibold text-gray-800">{ex.label}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{ex.upiId}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {result && (() => {
        const cfg = riskConfig[result.riskLevel];
        const Icon = cfg.icon;
        return (
          <div className={`rounded-2xl border p-5 space-y-4 ${cfg.bg} ${cfg.border}`}>
            <div className="flex items-center gap-3">
              <Icon size={28} className={cfg.color} />
              <div>
                <p className={`font-bold text-lg ${cfg.color}`}>{cfg.label}</p>
                <p className="text-sm text-gray-600">{result.summary}</p>
              </div>
            </div>

            {/* Risk score bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Risk Score</span>
                <span className={`font-bold ${cfg.color}`}>{result.riskScore}/100</span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`} style={{ width: `${result.riskScore}%` }} />
              </div>
            </div>

            {/* Flags */}
            {result.flags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Risk Factors Detected:</p>
                <div className="space-y-1.5">
                  {result.flags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-500 mt-0.5">⚠</span>
                      <span className="text-gray-700">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="bg-white/70 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">AI Recommendation</p>
              <p className="text-sm text-gray-700">{result.recommendation}</p>
            </div>
          </div>
        );
      })()}

      {/* Common scam types */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Common UPI Scams to Avoid</h2>
        <div className="space-y-3">
          {[
            { icon: "🎰", title: "Lottery / Prize Scams", desc: "You win a KBC prize but need to pay ₹1 to 'claim' it. The ₹1 is just to get your UPI pin." },
            { icon: "🏦", title: "Fake Bank Officials", desc: "Someone claims to be from your bank and asks for OTP or UPI pin to 'verify' your account." },
            { icon: "🛍️", title: "OLX / Marketplace Fraud", desc: "Buyer sends a QR code to 'pay you' — clicking it actually debits your account." },
            { icon: "📱", title: "Screen Mirroring Apps", desc: "Scammers ask you to install AnyDesk/TeamViewer to 'help' and then access your payment apps." },
          ].map(s => (
            <div key={s.title} className="flex gap-3">
              <span className="text-xl shrink-0">{s.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

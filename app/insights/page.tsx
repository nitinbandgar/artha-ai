"use client";
import { useState, useEffect, useCallback } from "react";
import { getCategoryBreakdown, getMonthlySpending, UPCOMING_BILLS, TRANSACTIONS } from "@/lib/mock-data";
import { formatCurrency, formatDateShort, getDaysUntil } from "@/lib/utils";
import { RefreshCw, Volume2, Loader2, Send, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useLanguage } from "@/lib/language-context";
import LanguageSelector from "@/components/ui/LanguageSelector";
import VoiceButton from "@/components/ui/VoiceButton";
import { playTTS } from "@/lib/speak";

type Insight = {
  headline: string;
  bullets: string[];
  tip: string;
  mood: "good" | "okay" | "overspent";
};

const MOOD_CONFIG = {
  good:      { label: "On track 🎉", bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  icon: TrendingDown },
  okay:      { label: "Watch it 👀", bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  icon: Minus },
  overspent: { label: "Overspent ⚠️", bg: "bg-red-50",   border: "border-red-200",    text: "text-red-700",    icon: TrendingUp },
};

const QA_PLACEHOLDER: Record<string, string> = {
  "en-IN": "Ask anything… e.g. Why did I spend more this month?",
  "hi-IN": "कुछ भी पूछें… जैसे इस महीने ज़्यादा क्यों खर्च हुआ?",
  "mr-IN": "काहीही विचारा… उदा. या महिन्यात जास्त का खर्च झाला?",
  "ta-IN": "எதையும் கேளுங்கள்… ஏன் இம்மாதம் அதிகம் செலவானது?",
  "te-IN": "ఏదైనా అడగండి… ఈ నెల ఎందుకు ఎక్కువ ఖర్చయింది?",
  "bn-IN": "যেকোনো কিছু জিজ্ঞেস করুন… এই মাসে বেশি খরচ কেন?",
};

export default function InsightsPage() {
  const { language } = useLanguage();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [qaInput, setQaInput] = useState("");
  const [qaAnswer, setQaAnswer] = useState("");
  const [qaLoading, setQaLoading] = useState(false);

  const categories   = getCategoryBreakdown("2026-05");
  const thisMonthSpend = getMonthlySpending("2026-05");
  const lastMonthSpend = getMonthlySpending("2026-04");
  const diff = thisMonthSpend - lastMonthSpend;

  const spendingContext = `
- This month: ₹${thisMonthSpend.toLocaleString("en-IN")}, Last month: ₹${lastMonthSpend.toLocaleString("en-IN")}
- Top categories: ${categories.slice(0, 4).map(c => `${c.name} ₹${c.value.toLocaleString("en-IN")}`).join(", ")}
- Recent: ${TRANSACTIONS.slice(0, 6).map(t => `${t.merchant} ₹${t.amount}`).join(", ")}
- Upcoming bills: ${UPCOMING_BILLS.map(b => `${b.name} ₹${b.amount} due ${b.dueDate}`).join(", ")}`.trim();

  const loadInsight = useCallback(async () => {
    setLoading(true);
    setInsight(null);
    try {
      const res = await fetch("/api/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: TRANSACTIONS.slice(0, 20),
          thisMonthSpend, lastMonthSpend,
          categories: categories.slice(0, 5),
          upcomingBills: UPCOMING_BILLS,
          languageCode: language.code,
          languageLabel: language.label,
        }),
      });
      const data = await res.json();
      setInsight(data);
    } catch {
      setInsight({ headline: "Could not load insights", bullets: ["Please try again."], tip: "", mood: "okay" });
    } finally {
      setLoading(false);
    }
  }, [language.code]);

  useEffect(() => { loadInsight(); }, [loadInsight]);

  // TTS for the full summary (uses shared lib/speak.ts)
  async function speakInsight() {
    if (!insight) return;
    setSpeaking(true);
    const textToSpeak = `${insight.headline}. ${insight.bullets.join(". ")}. ${insight.tip}`;
    await playTTS(textToSpeak, language.code, () => setSpeaking(false));
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  // Q&A — text or voice → answer + TTS
  const askQuestion = useCallback(async (question: string) => {
    if (!question.trim()) return;
    setQaLoading(true);
    setQaAnswer("");
    setQaInput("");
    try {
      const res = await fetch("/api/insights-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, spendingContext, languageCode: language.code, languageLabel: language.label }),
      });
      const data = await res.json();
      setQaAnswer(data.answer);
      // Auto-speak the answer (Sarvam → browser fallback)
      await playTTS(data.answer, language.code);
    } catch {
      setQaAnswer("Sorry, could not answer that. Please try again.");
    } finally {
      setQaLoading(false);
    }
  }, [spendingContext, language]);

  const mood = insight ? MOOD_CONFIG[insight.mood] : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-xs text-gray-400 mt-0.5">{language.nativeLabel} · May 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector compact />
          <button onClick={loadInsight} disabled={loading}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── MONTH STATS ── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Spent</p>
          <p className="text-base font-bold text-gray-900">{formatCurrency(thisMonthSpend)}</p>
        </div>
        <div className={`rounded-2xl border shadow-sm p-3 text-center ${diff > 0 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
          <p className="text-xs text-gray-400 mb-1">vs Last Month</p>
          <p className={`text-base font-bold ${diff > 0 ? "text-red-600" : "text-green-600"}`}>
            {diff > 0 ? "▲" : "▼"} {formatCurrency(Math.abs(diff))}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Bills Due</p>
          <p className="text-base font-bold text-gray-900">{formatCurrency(UPCOMING_BILLS.reduce((s, b) => s + b.amount, 0))}</p>
        </div>
      </div>

      {/* ── AI SUMMARY CARD ── */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="text-sm font-semibold text-indigo-900">AI Summary</span>
            {mood && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${mood.bg} ${mood.border} ${mood.text}`}>
                {mood.label}
              </span>
            )}
          </div>
          {/* Speak / Stop button */}
          <button
            onClick={speaking ? stopSpeaking : speakInsight}
            disabled={loading || !insight}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 ${
              speaking
                ? "bg-indigo-600 text-white"
                : "bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            <Volume2 size={13} className={speaking ? "animate-pulse" : ""} />
            {speaking ? "Stop" : "Play"}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-4 text-indigo-500">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Analysing your spending…</span>
          </div>
        ) : insight ? (
          <div className="space-y-2.5">
            {/* Headline */}
            <p className="text-sm font-semibold text-indigo-900">{insight.headline}</p>
            {/* Bullets */}
            <ul className="space-y-1.5">
              {insight.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-indigo-800 leading-snug">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            {/* Tip */}
            {insight.tip && (
              <div className="mt-2 bg-white/70 rounded-xl px-3 py-2 flex items-start gap-2">
                <span className="text-base shrink-0">💡</span>
                <p className="text-xs text-indigo-800 leading-relaxed">{insight.tip}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* ── VOICE Q&A ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">
          🎙️ Ask about your spending
        </p>

        {qaAnswer && (
          <div className="mb-3 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
            <p className="text-sm text-indigo-800 leading-relaxed">{qaAnswer}</p>
          </div>
        )}

        <div className="flex gap-2 items-center">
          <VoiceButton onTranscript={q => askQuestion(q)} disabled={qaLoading} />
          <input
            type="text"
            value={qaInput}
            onChange={e => setQaInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") askQuestion(qaInput); }}
            placeholder={QA_PLACEHOLDER[language.code] || QA_PLACEHOLDER["en-IN"]}
            disabled={qaLoading}
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
          />
          <button
            onClick={() => askQuestion(qaInput)}
            disabled={qaLoading || !qaInput.trim()}
            className="p-2.5 bg-indigo-600 text-white rounded-xl disabled:opacity-40 hover:bg-indigo-700"
          >
            {qaLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Tap mic or type · Answer plays in {language.nativeLabel}
        </p>
      </div>

      {/* ── SPENDING PIE ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">Spending Breakdown</p>
        <div className="flex gap-4 items-center">
          <div className="w-32 h-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={56} paddingAngle={2}>
                  {categories.map((cat, i) => <Cell key={i} fill={cat.color} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {categories.slice(0, 5).map(cat => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-gray-600 flex-1 truncate">{cat.icon} {cat.name}</span>
                <span className="text-xs font-semibold text-gray-900">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── UPCOMING BILLS ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">📅 Upcoming Bills</p>
        <div className="space-y-2.5">
          {UPCOMING_BILLS.map(bill => {
            const days = getDaysUntil(bill.dueDate);
            const urgent = days <= 7;
            const soon = days <= 14;
            return (
              <div key={bill.name} className="flex items-center gap-3">
                <span className={`text-xl w-8 text-center ${urgent ? "animate-pulse" : ""}`}>{bill.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{bill.name}</p>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                    urgent ? "bg-red-100 text-red-600" : soon ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {days}d · {formatDateShort(bill.dueDate)}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">{formatCurrency(bill.amount)}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

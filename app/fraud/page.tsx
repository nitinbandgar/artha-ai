"use client";
import { useState, useRef, useCallback } from "react";
import { ShieldCheck, Loader2, AlertTriangle, CheckCircle2, XCircle, Shield, Volume2, Mic } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import LanguageSelector from "@/components/ui/LanguageSelector";
import VoiceButton from "@/components/ui/VoiceButton";

type RiskLevel = "low" | "medium" | "high";

type FraudResult = {
  riskLevel: RiskLevel;
  riskScore: number;
  summary: string;
  flags: string[];
  recommendation: string;
};

const EXAMPLE_PAYMENTS = [
  { label: "✅ Known friend",  upiId: "rahul.sharma@okicici",   amount: "500", name: "Rahul Sharma" },
  { label: "🚨 Lottery scam", upiId: "claim9944refund@paytm",  amount: "1",   name: "KBC Lottery" },
  { label: "🛒 Merchant",     upiId: "swiggy@icici",           amount: "320", name: "Swiggy" },
  { label: "⚠️ OTP scam",    upiId: "verify.bank.secure@ybl", amount: "10",  name: "Bank Verification" },
];

// Stern audio alert messages per language for HIGH risk
const HIGH_RISK_ALERT: Record<string, string> = {
  "en-IN": "Warning! This payment is very risky. It matches a known scam pattern. Do not send money. Please cancel immediately.",
  "hi-IN": "खबरदार! यह payment बहुत खतरनाक है। यह एक जाना-माना scam है। पैसे मत भेजिए। तुरंत रद्द करें।",
  "mr-IN": "सावधान! ही payment अत्यंत धोकादायक आहे। हा एक ज्ञात scam आहे. पैसे पाठवू नका. ताबडतोब रद्द करा.",
  "ta-IN": "எச்சரிக்கை! இந்த payment மிகவும் ஆபத்தானது. இது ஒரு அறியப்பட்ட மோசடி. பணம் அனுப்பாதீர்கள். உடனே ரத்து செய்யுங்கள்.",
  "te-IN": "హెచ్చరిక! ఈ payment చాలా ప్రమాదకరం. ఇది తెలిసిన మోసం. డబ్బు పంపవద్దు. వెంటనే రద్దు చేయండి.",
  "bn-IN": "সাবধান! এই payment অত্যন্ত বিপজ্জনক। এটি একটি পরিচিত প্রতারণা। টাকা পাঠাবেন না। এখনই বাতিল করুন।",
};

const riskConfig = {
  low:  { color: "text-green-600", bg: "bg-green-50",  border: "border-green-200",  icon: CheckCircle2, label: "Low Risk — Safe to pay",       bar: "bg-green-500" },
  medium:{ color: "text-amber-600", bg: "bg-amber-50",  border: "border-amber-200",  icon: AlertTriangle, label: "Medium Risk — Verify first",  bar: "bg-amber-500" },
  high: { color: "text-red-600",   bg: "bg-red-50",    border: "border-red-200",    icon: XCircle,      label: "HIGH RISK — Do NOT pay",         bar: "bg-red-500" },
};

export default function FraudPage() {
  const { language } = useLanguage();
  const [form, setForm] = useState({ upiId: "", amount: "", name: "", note: "" });
  const [result, setResult] = useState<FraudResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Browser TTS fallback ──
  function browserSpeak(text: string, langCode: string, onEnd?: () => void) {
    if (typeof window === "undefined" || !window.speechSynthesis) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text.slice(0, 300));
    utt.lang = langCode;
    utt.rate = 0.92;
    utt.onend = () => onEnd?.();
    utt.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utt);
  }

  // Play any text — Sarvam first, browser fallback
  const speakText = useCallback(async (text: string) => {
    setSpeaking(true);
    const done = () => setSpeaking(false);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 400), languageCode: language.code }),
      });
      const data = await res.json();
      if (data.audio) {
        if (audioRef.current) audioRef.current.pause();
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audioRef.current = audio;
        audio.onended = done;
        audio.onerror = () => browserSpeak(text, language.code, done);
        audio.play().catch(() => browserSpeak(text, language.code, done));
      } else {
        browserSpeak(text, language.code, done);
      }
    } catch {
      browserSpeak(text, language.code, done);
    }
  }, [language.code]);

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
      const data: FraudResult = await res.json();
      setResult(data);

      // Auto-play audio based on risk level
      if (data.riskLevel === "high") {
        // Stern alert for high risk
        const alertText = HIGH_RISK_ALERT[language.code] || HIGH_RISK_ALERT["en-IN"];
        speakText(alertText);
      } else {
        // Summary + recommendation for low/medium
        speakText(`${data.summary}. ${data.recommendation}`);
      }
    } catch {
      setResult({
        riskLevel: "medium", riskScore: 50,
        summary: "Could not analyze. Proceed with caution.",
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
    if (audioRef.current) audioRef.current.pause();
    setSpeaking(false);
  }

  // Voice input for UPI ID field
  function handleUpiVoice(transcript: string) {
    // Extract UPI ID pattern from speech (e.g. "rahul dot sharma at ok icici")
    const cleaned = transcript
      .toLowerCase()
      .replace(/\s+dot\s+/g, ".")
      .replace(/\s+at\s+/g, "@")
      .replace(/\s+/g, "");
    setForm(f => ({ ...f, upiId: cleaned }));
  }

  // Voice input for payment note/reason
  function handleNoteVoice(transcript: string) {
    setForm(f => ({ ...f, note: transcript }));
  }

  const cfg = result ? riskConfig[result.riskLevel] : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
            <ShieldCheck size={16} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Fraud Guard</h1>
            <p className="text-xs text-gray-400">AI risk scan · voice alerts · {language.nativeLabel}</p>
          </div>
        </div>
        <LanguageSelector compact />
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "UPI Fraud (FY24)", value: "₹1,470 Cr" },
          { label: "Fraud cases",      value: "13.4L+" },
          { label: "Avg loss/victim",  value: "₹10,900" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
            <p className="text-sm font-bold text-red-500">{s.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── FORM ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-900">Check Before You Pay</p>

        {/* UPI ID + voice mic */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">UPI ID *</label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="e.g. name@okicici"
              value={form.upiId}
              onChange={e => setForm(f => ({ ...f, upiId: e.target.value }))}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div title="Speak the UPI ID">
              <VoiceButton onTranscript={handleUpiVoice} />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            🎙️ Say UPI ID aloud in {language.nativeLabel} — e.g. &ldquo;rahul dot sharma at ok icici&rdquo;
          </p>
        </div>

        {/* Amount + Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Amount (₹) *</label>
            <input type="number" placeholder="0" value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Payee Name</label>
            <input type="text" placeholder="Optional" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
        </div>

        {/* Reason / note + voice */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Payment reason</label>
          <div className="flex gap-2 items-center">
            <input type="text" placeholder="e.g. lottery prize, OTP verification…"
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <div title="Speak the reason">
              <VoiceButton onTranscript={handleNoteVoice} />
            </div>
          </div>
        </div>

        <button onClick={check} disabled={loading || !form.upiId || !form.amount}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm disabled:opacity-40 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Analysing…</>
            : <><Shield size={16} /> Run AI Risk Scan</>}
        </button>
      </div>

      {/* ── QUICK EXAMPLES ── */}
      <div>
        <p className="text-xs font-medium text-gray-400 mb-2">Try these examples:</p>
        <div className="grid grid-cols-2 gap-2">
          {EXAMPLE_PAYMENTS.map(ex => (
            <button key={ex.upiId} onClick={() => fill(ex)}
              className="text-left p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all">
              <p className="text-xs font-semibold text-gray-800">{ex.label}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{ex.upiId}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── RESULT ── */}
      {result && cfg && (() => {
        const Icon = cfg.icon;
        const isHigh = result.riskLevel === "high";
        return (
          <div className={`rounded-2xl border p-5 space-y-4 ${cfg.bg} ${cfg.border} ${isHigh ? "ring-2 ring-red-300" : ""}`}>

            {/* Risk header */}
            <div className="flex items-start gap-3">
              <Icon size={28} className={cfg.color} />
              <div className="flex-1">
                <p className={`font-bold text-lg ${cfg.color}`}>{cfg.label}</p>
                <p className="text-sm text-gray-700 mt-0.5">{result.summary}</p>
              </div>
              {/* Replay audio */}
              <button
                onClick={() => {
                  const text = isHigh
                    ? (HIGH_RISK_ALERT[language.code] || HIGH_RISK_ALERT["en-IN"])
                    : `${result.summary}. ${result.recommendation}`;
                  speakText(text);
                }}
                className={`shrink-0 p-2 rounded-xl transition-colors ${
                  speaking ? "bg-indigo-600 text-white" : `bg-white/70 ${cfg.color}`
                }`}
                title="Replay audio alert"
              >
                <Volume2 size={16} className={speaking ? "animate-pulse" : ""} />
              </button>
            </div>

            {/* HIGH RISK banner */}
            {isHigh && (
              <div className="bg-red-600 text-white rounded-xl p-3 flex items-center gap-2 text-sm font-semibold">
                <span className="text-xl">🚨</span>
                {language.code === "hi-IN" ? "यह payment एक scam है। बिल्कुल मत भेजिए!" :
                 language.code === "mr-IN" ? "ही payment एक scam आहे. पैसे पाठवू नका!" :
                 language.code === "ta-IN" ? "இது ஒரு மோசடி. பணம் அனுப்பாதீர்கள்!" :
                 language.code === "te-IN" ? "ఇది మోసం. డబ్బు పంపవద్దు!" :
                 language.code === "bn-IN" ? "এটি একটি প্রতারণা। টাকা পাঠাবেন না!" :
                 "This is a scam. Do NOT send money!"}
              </div>
            )}

            {/* Risk score bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Risk Score</span>
                <span className={`font-bold ${cfg.color}`}>{result.riskScore}/100</span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
                  style={{ width: `${result.riskScore}%` }} />
              </div>
            </div>

            {/* Flags */}
            {result.flags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Risk Factors Detected:</p>
                <div className="space-y-1.5">
                  {result.flags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-500 shrink-0">⚠</span>
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

      {/* ── SCAM TYPES ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">Common UPI Scams</p>
        <div className="space-y-2.5">
          {[
            { icon: "🎰", title: "Lottery / KBC Prize", desc: "Asked to pay ₹1 to claim a prize? It's a scam." },
            { icon: "🏦", title: "Fake Bank Official", desc: "Real banks never ask for OTP or UPI PIN." },
            { icon: "🛍️", title: "OLX Buyer Scam", desc: "A QR code 'to pay you' actually debits your account." },
            { icon: "📱", title: "Screen Share Fraud", desc: "Never install AnyDesk/TeamViewer for someone you don't know." },
          ].map(s => (
            <div key={s.title} className="flex gap-3 items-start">
              <span className="text-xl shrink-0">{s.icon}</span>
              <div>
                <p className="text-xs font-semibold text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

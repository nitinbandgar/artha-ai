"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { CONTACTS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Send, Loader2, Scissors, CheckCircle2, Copy, Volume2 } from "lucide-react";
import VoiceButton from "@/components/ui/VoiceButton";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/lib/language-context";

type Message = { id: string; role: "user" | "assistant"; content: string; splitData?: SplitResult };
type SplitResult = { total: number; description: string; splits: { name: string; upiId: string; amount: number; avatar: string }[] };

const QUICK_PROMPTS: Record<string, string[]> = {
  "en-IN": ["Split ₹840 Swiggy dinner equally with Rahul and Priya", "Divide ₹2,100 Zomato lunch 4 ways", "₹1,200 Uber with Arjun, I pay 60%"],
  "hi-IN": ["Rahul aur Priya ke saath ₹840 ka Swiggy barabar baanto", "₹2,100 ka Zomato 4 logo mein baanto", "Arjun ke saath ₹1,200 ka Uber, main 60% dunga"],
  "mr-IN": ["Rahul ani Priya sobat ₹840 cha Swiggy samaan vaata", "₹2,100 cha Zomato 4 jananat vaata"],
  "ta-IN": ["Rahul மற்றும் Priya உடன் ₹840 Swiggy சரிசமாக பிரிக்கவும்"],
  "te-IN": ["Rahul మరియు Priya తో ₹840 Swiggy సమానంగా విభజించండి"],
  "bn-IN": ["Rahul এবং Priya এর সাথে ₹840 Swiggy সমানভাগ করুন"],
};

const WELCOME: Record<string, string> = {
  "en-IN": "Hey! 👋 Tap the mic and speak — or type below. I'll split the bill and send UPI links instantly.",
  "hi-IN": "नमस्ते! 👋 माइक दबाएं और बोलें — मैं बिल बांट दूंगा और UPI लिंक्स भेजूंगा।",
  "mr-IN": "नमस्कार! 👋 माइक दाबा आणि बोला — मी बिल वाटून UPI लिंक्स पाठवेन।",
  "ta-IN": "வணக்கம்! 👋 மைக்கை தட்டி பேசுங்கள் — பில் பிரித்து UPI லிங்க் தருகிறேன்.",
  "te-IN": "నమస్కారం! 👋 మైక్ నొక్కి మాట్లాడండి — బిల్ విభజించి UPI లింక్ ఇస్తాను.",
  "bn-IN": "নমস্কার! 👋 মাইক ট্যাপ করুন — বিল ভাগ করে UPI লিঙ্ক পাঠাবো।",
};

export default function SplitPage() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ id: "welcome", role: "assistant", content: WELCOME[language.code] || WELCOME["en-IN"] }]);
  }, [language.code]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ── TTS via Sarvam ──
  const speakText = useCallback(async (text: string, msgId: string) => {
    setSpeakingId(msgId);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 400), languageCode: language.code }),
      });
      const data = await res.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audio.onended = () => setSpeakingId(null);
        audio.onerror = () => setSpeakingId(null);
        audio.play();
      } else setSpeakingId(null);
    } catch { setSpeakingId(null); }
  }, [language.code]);

  // ── Core send ──
  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, contacts: CONTACTS, languageCode: language.code, languageLabel: language.label }),
      });
      const data = await res.json();
      const replyId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: replyId, role: "assistant", content: data.message || "Done!", splitData: data.splitData }]);
      if (data.message) speakText(data.message, replyId);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }, [loading, language, speakText]);

  function copyUpiLink(name: string, upiId: string, amount: number) {
    navigator.clipboard.writeText(`upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`);
    setCopiedId(upiId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const prompts = QUICK_PROMPTS[language.code] || QUICK_PROMPTS["en-IN"];

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[100dvh] md:h-screen">

      {/* ── HEADER ── */}
      <div className="shrink-0 px-4 pt-5 pb-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
              <Scissors size={16} className="text-violet-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Smart Split</h1>
              <p className="text-xs text-gray-400">Speak or type · AI splits + UPI links</p>
            </div>
          </div>
          <LanguageSelector compact />
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {CONTACTS.map(c => (
            <div key={c.upiId} className="shrink-0 flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">{c.avatar}</div>
              <span className="text-[10px] text-gray-400">{c.name.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[88%]">
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold mb-1">A</div>
              )}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-sm"
                  : "bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm"
              }`}>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    {msg.content.split("\n").map((l, i) => <p key={i} className={i > 0 ? "mt-1" : ""}>{l}</p>)}
                  </div>
                  {msg.role === "assistant" && (
                    <button onClick={() => speakText(msg.content, msg.id)}
                      className={`shrink-0 p-1 rounded-lg transition-colors mt-0.5 ${speakingId === msg.id ? "text-indigo-600 bg-indigo-50" : "text-gray-300 hover:text-indigo-500"}`}>
                      <Volume2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {msg.splitData && (
                <div className="mt-2 bg-white border border-indigo-100 shadow-sm rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Split Summary</p>
                    <span className="text-sm font-bold text-indigo-600">{formatCurrency(msg.splitData.total)}</span>
                  </div>
                  {msg.splitData.splits.map(s => (
                    <div key={s.upiId} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">{s.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-400 truncate">{s.upiId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(s.amount)}</span>
                        <button onClick={() => copyUpiLink(s.name, s.upiId, s.amount)}
                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors">
                          {copiedId === s.upiId ? <CheckCircle2 size={13} className="text-green-600" /> : <Copy size={13} className="text-indigo-600" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="bg-indigo-50 rounded-xl p-2.5 text-xs text-indigo-700 text-center">
                    📱 Tap copy → share UPI link on WhatsApp
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-indigo-500" />
              <span className="text-xs text-gray-400">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── QUICK PROMPTS ── */}
      <div className="shrink-0 px-4 pt-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {prompts.map(p => (
            <button key={p} onClick={() => send(p)} disabled={loading}
              className="shrink-0 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-3 py-1.5 hover:bg-indigo-100 transition-colors disabled:opacity-40">
              {p.length > 36 ? p.slice(0, 36) + "…" : p}
            </button>
          ))}
        </div>
      </div>

      {/* ── INPUT ROW ── */}
      <div className="shrink-0 px-4 pt-2 pb-5 bg-white">
        <div className="flex items-center gap-3">
          {/* Voice button — interim text shows in input, final auto-sends */}
          <VoiceButton
            onTranscript={(text) => send(text)}
            onInterim={(text) => setInput(text)}
            disabled={loading}
          />

          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }}}
            placeholder={
              language.code === "hi-IN" ? "माइक दबाएं या यहाँ टाइप करें…" :
              language.code === "mr-IN" ? "माइक दाबा किंवा इथे टाइप करा…" :
              language.code === "ta-IN" ? "மைக் தட்டுங்கள் அல்லது தட்டச்சு செய்யுங்கள்…" :
              language.code === "te-IN" ? "మైక్ నొక్కండి లేదా టైప్ చేయండి…" :
              language.code === "bn-IN" ? "মাইক ট্যাপ করুন বা টাইপ করুন…" :
              "Tap mic to speak or type here…"
            }
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white disabled:opacity-50 transition-colors"
          />

          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            className="p-3 bg-indigo-600 text-white rounded-2xl disabled:opacity-40 hover:bg-indigo-700 transition-colors">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-2">
          🎙️ Tap mic → speak in <strong>{language.nativeLabel}</strong> → auto sends · reply plays in <strong>{language.nativeLabel}</strong>
        </p>
      </div>
    </div>
  );
}

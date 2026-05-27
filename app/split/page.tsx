"use client";
import { useState, useRef, useEffect } from "react";
import { CONTACTS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Send, Loader2, Scissors, CheckCircle2, Copy, Volume2 } from "lucide-react";
import VoiceButton from "@/components/ui/VoiceButton";
import { useLanguage } from "@/lib/language-context";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  splitData?: SplitResult;
};

type SplitResult = {
  total: number;
  description: string;
  splits: { name: string; upiId: string; amount: number; avatar: string }[];
};

const QUICK_PROMPTS: Record<string, string[]> = {
  "en-IN": [
    "Split ₹840 Swiggy dinner equally with Rahul and Priya",
    "Divide ₹2,100 Zomato team lunch 4 ways",
    "₹1,200 Uber ride with Arjun, I pay more (60%)",
  ],
  "hi-IN": [
    "Rahul aur Priya ke saath ₹840 ka Swiggy ka khana barabar baanto",
    "₹2,100 ka Zomato lunch 4 logo mein baanto",
    "Arjun ke saath ₹1,200 ka Uber, main zyada dunga (60%)",
  ],
  "mr-IN": [
    "Rahul ani Priya sobat ₹840 cha Swiggy jevan samaan vaata",
    "₹2,100 cha Zomato lunch 4 jananat vaata",
  ],
  "ta-IN": [
    "Rahul மற்றும் Priya உடன் ₹840 Swiggy சாப்பாடு சரிசமாக பிரிக்கவும்",
  ],
  "te-IN": [
    "Rahul మరియు Priya తో ₹840 Swiggy భోజనం సమానంగా విభజించండి",
  ],
  "bn-IN": [
    "Rahul এবং Priya এর সাথে ₹840 Swiggy খাবার সমানভাবে ভাগ করুন",
  ],
};

export default function SplitPage() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Set welcome message based on language
  useEffect(() => {
    const welcomes: Record<string, string> = {
      "en-IN": "Hey! 👋 I'm your AI split assistant. Tell me about an expense and I'll split it and generate UPI links instantly.",
      "hi-IN": "नमस्ते! 👋 मैं आपका AI बिल स्प्लिट सहायक हूँ। मुझे खर्च के बारे में बताएं और मैं UPI लिंक तुरंत बनाऊंगा।",
      "mr-IN": "नमस्कार! 👋 मी तुमचा AI बिल स्प्लिट सहाय्यक आहे। खर्चाबद्दल सांगा आणि मी UPI लिंक्स तयार करेन।",
      "ta-IN": "வணக்கம்! 👋 நான் உங்கள் AI பில் பிரிக்கும் உதவியாளர். செலவைப் பற்றி சொல்லுங்கள், UPI இணைப்புகள் உடனே தயார்.",
      "te-IN": "నమస్కారం! 👋 నేను మీ AI బిల్ స్ప్లిట్ సహాయకుడిని. ఖర్చు గురించి చెప్పండి, UPI లింక్‌లు వెంటనే తయారవుతాయి.",
      "bn-IN": "নমস্কার! 👋 আমি আপনার AI বিল স্প্লিট সহায়ক। খরচের কথা বলুন এবং আমি UPI লিঙ্ক তৈরি করব।",
    };
    setMessages([{
      id: "0",
      role: "assistant",
      content: welcomes[language.code] || welcomes["en-IN"],
    }]);
  }, [language]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function speakText(text: string) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, languageCode: language.code }),
      });
      const data = await res.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audio.play();
      }
    } catch (err) {
      console.error("TTS error", err);
    }
  }

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          contacts: CONTACTS,
          languageCode: language.code,
          languageLabel: language.label,
        }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        splitData: data.splitData,
      };
      setMessages(prev => [...prev, assistantMsg]);
      // Auto-speak the response
      if (data.message) speakText(data.message);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, couldn't process that. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  function copyUpiLink(name: string, upiId: string, amount: number) {
    const link = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;
    navigator.clipboard.writeText(link);
    setCopiedId(upiId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const prompts = QUICK_PROMPTS[language.code] || QUICK_PROMPTS["en-IN"];

  const placeholders: Record<string, string> = {
    "en-IN": "e.g. Split ₹1,200 dinner with Rahul and Priya...",
    "hi-IN": "जैसे: Rahul aur Priya ke saath ₹1,200 ka khana baanto...",
    "mr-IN": "उदा: Rahul ani Priya sobat ₹1,200 cha jevan vaata...",
    "ta-IN": "எ.கா: Rahul மற்றும் Priya உடன் ₹1,200 பிரிக்கவும்...",
    "te-IN": "ఉదా: Rahul మరియు Priya తో ₹1,200 విభజించండి...",
    "bn-IN": "যেমন: Rahul এবং Priya এর সাথে ₹1,200 ভাগ করুন...",
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: "calc(100vh - 0px)" }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
            <Scissors size={16} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Smart Split</h1>
            <p className="text-xs text-gray-500">AI bill splitting · UPI collect links · {language.nativeLabel}</p>
          </div>
        </div>
        {/* Contacts strip */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {CONTACTS.map(c => (
            <div key={c.upiId} className="shrink-0 flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                {c.avatar}
              </div>
              <span className="text-[10px] text-gray-500">{c.name.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%]">
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold mb-1">A</div>
              )}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-sm"
                  : "bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm"
              }`}>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    {msg.content.split("\n").map((line, i) => <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p>)}
                  </div>
                  {msg.role === "assistant" && msg.content && (
                    <button
                      onClick={() => speakText(msg.content)}
                      className="shrink-0 p-1 text-indigo-400 hover:text-indigo-600 mt-0.5"
                      title="Read aloud"
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Split Result Card */}
              {msg.splitData && (
                <div className="mt-2 bg-white border border-gray-100 shadow-sm rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Split Summary</p>
                    <span className="text-sm font-bold text-indigo-600">{formatCurrency(msg.splitData.total)}</span>
                  </div>
                  <div className="space-y-2">
                    {msg.splitData.splits.map(s => (
                      <div key={s.upiId} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                          {s.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-400 truncate">{s.upiId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(s.amount)}</span>
                          <button
                            onClick={() => copyUpiLink(s.name, s.upiId, s.amount)}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                          >
                            {copiedId === s.upiId ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-700 text-center">
                    📱 UPI collect links ready — share via WhatsApp
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 size={16} className="animate-spin text-indigo-600" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-4 py-2 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {prompts.map(p => (
            <button
              key={p}
              onClick={() => send(p)}
              className="shrink-0 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-3 py-1.5 hover:bg-indigo-100 transition-colors"
            >
              {p.length > 38 ? p.slice(0, 38) + "…" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Input row */}
      <div className="px-4 pb-6 pt-1 shrink-0">
        <div className="flex gap-2 items-center">
          {/* Voice button */}
          <VoiceButton onTranscript={(t) => { setInput(t); }} disabled={loading} />
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            placeholder={placeholders[language.code] || placeholders["en-IN"]}
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="p-3 bg-indigo-600 text-white rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          🎙️ Tap mic to speak in {language.nativeLabel} · AI responds in {language.nativeLabel}
        </p>
      </div>
    </div>
  );
}

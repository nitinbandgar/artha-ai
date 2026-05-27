"use client";
import { useState, useRef, useEffect } from "react";
import { CONTACTS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Send, Loader2, Scissors, CheckCircle2, Copy } from "lucide-react";

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

const QUICK_PROMPTS = [
  "Split ₹840 Swiggy dinner equally with Rahul and Priya",
  "Divide ₹2,100 Zomato team lunch 4 ways",
  "₹1,200 Uber ride with Arjun, I'll pay more (60%)",
  "Split last night's ₹3,600 restaurant bill with Sneha and Vikram",
];

export default function SplitPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: "Hey! 👋 I'm your AI split assistant. Tell me about an expense and I'll calculate who owes what and generate UPI collect requests instantly.\n\nTry something like: \"Split ₹840 Swiggy order with Rahul and Priya\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        body: JSON.stringify({ message: text, contacts: CONTACTS }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        splitData: data.splitData,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't process that. Please try again.",
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

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-screen md:h-auto">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
            <Scissors size={16} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Smart Split</h1>
            <p className="text-xs text-gray-500">AI-powered bill splitting via UPI</p>
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
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-2" style={{ maxHeight: "calc(100vh - 280px)" }}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${msg.role === "user" ? "" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold mb-1">A</div>
              )}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-sm"
                  : "bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm"
              }`}>
                {msg.content.split("\n").map((line, i) => <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p>)}
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
                            title="Copy UPI request link"
                          >
                            {copiedId === s.upiId ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-700 text-center">
                    📱 UPI collect request links copied — share via WhatsApp
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
      <div className="px-4 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => send(p)}
              className="shrink-0 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-3 py-1.5 hover:bg-indigo-100 transition-colors"
            >
              {p.length > 35 ? p.slice(0, 35) + "…" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-6 pt-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            placeholder="e.g. Split ₹1,200 dinner with Rahul and Priya..."
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
      </div>
    </div>
  );
}

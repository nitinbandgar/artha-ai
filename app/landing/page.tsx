import Link from "next/link";
import { ShieldCheck, Scissors, Lightbulb, Zap, ArrowRight, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">Artha<span className="text-indigo-500">AI</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:block">#AIInDigitalPayments</span>
          <Link href="/" className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
            Try App →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-12 text-center max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6">
          <span className="text-xs font-semibold text-indigo-600">🏆 Mumbai Tech Week × NPCI Hackathon</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
          India&apos;s Smartest<br />
          <span className="text-indigo-600">AI Payment Companion</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
          500 million Indians use UPI. ArthaAI makes every rupee smarter — with AI that splits bills, predicts fraud, and tells your financial story.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <Link href="/" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            <Zap size={18} />
            Try ArthaAI Live
          </Link>
          <a href="https://github.com/nitinbandgar/artha-ai" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-50 text-gray-700 font-semibold rounded-2xl hover:bg-gray-100 transition-colors border border-gray-200">
            View on GitHub
          </a>
        </div>
        <p className="text-xs text-gray-400">No install needed · Works on any phone · Powered by UPI + Claude AI</p>
      </section>

      {/* App Preview Strip */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 py-10 px-6 mb-12">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "UPI Transactions", value: "38+", sub: "analyzed" },
              { label: "Fraud Patterns", value: "12+", sub: "detected" },
              { label: "Bill Splits", value: "1-tap", sub: "via AI" },
              { label: "Languages", value: "Voice", sub: "ready" },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-indigo-200 mt-0.5">{s.label}</p>
                <p className="text-xs text-indigo-300">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Three AI superpowers for your UPI life
        </h2>

        <div className="space-y-4">
          {/* Feature 1 */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                <Lightbulb size={22} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">AI Spending Narrative</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  Not charts. Not boring graphs. ArthaAI reads your UPI history and tells you your financial story in plain language — like a smart friend who actually reviewed your bank statement.
                </p>
                <div className="bg-white rounded-xl p-3 border border-amber-100">
                  <p className="text-xs text-gray-500 italic">
                    💬 <em>&quot;You spent 34% more on food this week. Swiggy + Zomato = ₹3,340. That&apos;s a flight to Goa every month.&quot;</em>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-3xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center shrink-0">
                <Scissors size={22} className="text-violet-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Smart Bill Split</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  No more WhatsApp arguments. Just describe the split in plain language — ArthaAI calculates shares and generates UPI collect request links instantly.
                </p>
                <div className="bg-white rounded-xl p-3 border border-violet-100">
                  <p className="text-xs text-gray-500 italic">
                    💬 <em>&quot;Split ₹2,100 Zomato dinner with Rahul and Priya, Priya owes more&quot;</em> → Done in 2 seconds
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-3xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck size={22} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">AI Fraud Guard</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  India loses ₹1,470 crore to UPI fraud every year. Before you hit Pay, ArthaAI scans the UPI ID, amount and context — and gives you a real-time risk score.
                </p>
                <div className="bg-white rounded-xl p-3 border border-green-100">
                  <p className="text-xs text-gray-500 italic">
                    🛡️ <em>HIGH RISK — &quot;claim9944refund@paytm&quot; matches known lottery scam pattern. Do not pay.</em>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-6 py-14">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Built on India&apos;s payment stack</h2>
          <p className="text-sm text-gray-500 text-center mb-8">Powered by NPCI&apos;s UPI rails + Anthropic&apos;s Claude AI</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: "⚡", label: "UPI + BBPS", sub: "NPCI Infrastructure" },
              { icon: "🤖", label: "Claude AI", sub: "Anthropic API" },
              { icon: "📱", label: "PWA", sub: "No install needed" },
            ].map(t => (
              <div key={t.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <p className="text-3xl mb-2">{t.icon}</p>
                <p className="text-sm font-bold text-gray-900">{t.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
          ))}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ready to make your UPI smarter?
        </h2>
        <p className="text-gray-500 text-sm mb-6">Try the live app — no signup, no install, works right in your browser.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 text-lg">
          Open ArthaAI <ArrowRight size={20} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">ArthaAI</span>
          </div>
          <p className="text-xs text-gray-400">Built for Mumbai Tech Week × NPCI · #AIInDigitalPayments · May 2026</p>
          <div className="flex gap-3 text-xs text-indigo-500 font-medium">
            <a href="https://github.com/nitinbandgar/artha-ai" target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link href="/">App</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

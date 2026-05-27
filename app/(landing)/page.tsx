import Link from "next/link";
import ArthaLogo from "@/components/ui/ArthaLogo";
import { ShieldCheck, Scissors, Lightbulb, ArrowRight, Zap, Star, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo + wordmark */}
          <div className="flex items-center gap-3">
            <ArthaLogo size={36} />
            <div>
              <span className="font-extrabold text-gray-900 text-xl tracking-tight">
                Artha<span className="text-indigo-600">AI</span>
              </span>
              <p className="text-[10px] text-gray-400 leading-none -mt-0.5 hidden sm:block">
                India&apos;s Smartest AI Payment Companion
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-medium text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
              #AIInDigitalPayments
            </span>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
              Try App <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative px-6 pt-20 pb-16 text-center overflow-hidden">
        {/* Background blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute -top-12 -right-24 w-80 h-80 bg-violet-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          {/* Hackathon badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <span className="text-lg">🏆</span>
            <span className="text-xs font-semibold text-indigo-700">
              Mumbai Tech Week × NPCI · #AIInDigitalPayments
            </span>
          </div>

          {/* Logo centred */}
          <div className="flex justify-center mb-6">
            <ArthaLogo size={80} />
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-3">
            Artha<span className="text-indigo-600">AI</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl font-semibold text-indigo-600 mb-4">
            India&apos;s Smartest AI Payment Companion
          </p>

          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            500 million Indians use UPI every day — but every rupee is blind.
            ArthaAI brings <strong>AI intelligence</strong> to every payment:
            split bills by voice, predict fraud in real-time, and understand your spending like never before.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 text-base"
            >
              <Zap size={20} />
              Try ArthaAI Free
            </Link>
            <a
              href="https://github.com/nitinbandgar/artha-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors text-base"
            >
              ⭐ View on GitHub
            </a>
          </div>

          <div className="flex flex-wrap gap-4 justify-center text-xs text-gray-400">
            {["No app install needed", "Works on any phone", "Powered by UPI + Claude AI", "Free to try"].map(t => (
              <span key={t} className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-green-500" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { value: "₹1,470 Cr", label: "UPI Fraud in India", sub: "FY2024" },
            { value: "500M+", label: "UPI Users", sub: "and growing" },
            { value: "3 AI", label: "Superpowers", sub: "built-in" },
            { value: "0 Install", label: "Needed", sub: "pure PWA" },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-4">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">{s.value}</p>
              <p className="text-xs text-indigo-200 mt-1">{s.label}</p>
              <p className="text-xs text-indigo-300">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Three AI superpowers.<br />One UPI app.
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            ArthaAI is proactive — it works for you before you even open the app.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className="group bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-6 hover:shadow-lg hover:shadow-amber-100 transition-all">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Lightbulb size={26} className="text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">AI Spending Narrative</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Not charts. Not boring graphs. Claude AI reads your UPI history and writes your personal financial story — with real insights you can act on.
            </p>
            <div className="bg-white rounded-xl p-3 border border-amber-100">
              <p className="text-xs text-gray-500 italic leading-relaxed">
                💬 &ldquo;You spent 34% more on food this week. Swiggy + Zomato = ₹3,340. That&apos;s a flight to Goa every month.&rdquo;
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-3xl p-6 hover:shadow-lg hover:shadow-violet-100 transition-all">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Scissors size={26} className="text-violet-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Smart Bill Split</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Just describe the split in plain language. ArthaAI calculates every share and generates UPI collect request links — ready to send on WhatsApp.
            </p>
            <div className="bg-white rounded-xl p-3 border border-violet-100">
              <p className="text-xs text-gray-500 italic leading-relaxed">
                ✂️ &ldquo;Split ₹2,100 Zomato with Rahul, Priya and Arjun&rdquo; → UPI links in 2 seconds
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-3xl p-6 hover:shadow-lg hover:shadow-green-100 transition-all">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck size={26} className="text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">AI Fraud Guard</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Before you hit Pay, ArthaAI scans the UPI ID, amount, and context against known Indian scam patterns — and gives you a risk score instantly.
            </p>
            <div className="bg-white rounded-xl p-3 border border-green-100">
              <p className="text-xs text-gray-500 italic leading-relaxed">
                🛡️ HIGH RISK — &ldquo;Matches lottery scam pattern. Do not pay.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Built on India&apos;s payment stack
          </h2>
          <p className="text-gray-500 mb-10 text-sm">
            NPCI&apos;s UPI infrastructure meets Anthropic&apos;s Claude AI
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: "⚡", label: "UPI + BBPS", sub: "NPCI Infrastructure" },
              { icon: "🤖", label: "Claude AI", sub: "Anthropic API" },
              { icon: "📱", label: "PWA", sub: "No install needed" },
              { icon: "🇮🇳", label: "Made for Bharat", sub: "12 languages ready" },
            ].map(t => (
              <div key={t.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-4xl mb-3">{t.icon}</p>
                <p className="text-sm font-bold text-gray-900">{t.label}</p>
                <p className="text-xs text-gray-400 mt-1">{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL / QUOTE ── */}
      <section className="px-6 py-16 max-w-3xl mx-auto text-center">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-10 text-white">
          <div className="flex justify-center mb-4">
            <ArthaLogo size={48} />
          </div>
          <blockquote className="text-xl sm:text-2xl font-bold leading-snug mb-4">
            &ldquo;ArthaAI turns your UPI history into financial wisdom — and your payment screen into a fraud shield.&rdquo;
          </blockquote>
          <p className="text-indigo-200 text-sm">
            Built for Mumbai Tech Week × NPCI · May 2026
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-6 pb-20 text-center max-w-2xl mx-auto">
        <div className="flex justify-center gap-0.5 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
          ))}
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
          Ready to make your UPI smarter?
        </h2>
        <p className="text-gray-500 mb-8">
          No signup. No install. Works right in your browser on any device.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 text-lg"
        >
          <Zap size={22} /> Open ArthaAI
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 bg-white px-6 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ArthaLogo size={28} />
            <span className="font-bold text-gray-800">ArthaAI</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-400">India&apos;s Smartest AI Payment Companion</span>
          </div>
          <p className="text-xs text-gray-400">
            Built for Mumbai Tech Week × NPCI · #AIInDigitalPayments · May 2026
          </p>
          <div className="flex gap-4 text-sm font-semibold text-indigo-600">
            <a href="https://github.com/nitinbandgar/artha-ai" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-800">GitHub</a>
            <Link href="/dashboard" className="hover:text-indigo-800">App</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

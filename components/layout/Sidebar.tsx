"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Scissors, Lightbulb, ShieldCheck, Zap } from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: List },
  { href: "/split", label: "Smart Split", icon: Scissors },
  { href: "/insights", label: "AI Insights", icon: Lightbulb },
  { href: "/fraud", label: "Fraud Guard", icon: ShieldCheck },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-gray-100 fixed top-0 left-0 z-40">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-gray-900 text-lg">Artha</span>
          <span className="text-indigo-500 text-lg font-bold">AI</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={18} className={active ? "text-indigo-600" : "text-gray-400"} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">N</div>
          <div>
            <p className="text-sm font-medium text-gray-900">Nitin</p>
            <p className="text-xs text-gray-400">nitin@okicici</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

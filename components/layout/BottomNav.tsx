"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Scissors, Lightbulb, ShieldCheck } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Spends", icon: List },
  { href: "/split", label: "Split", icon: Scissors },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/fraud", label: "Guard", icon: ShieldCheck },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 md:hidden">
      <div className="flex">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center py-2 gap-0.5">
              <Icon size={20} className={active ? "text-indigo-600" : "text-gray-400"} />
              <span className={`text-[10px] font-medium ${active ? "text-indigo-600" : "text-gray-400"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

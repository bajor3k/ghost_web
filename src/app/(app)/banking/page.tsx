
import { Metadata } from "next";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Banking · Ghost Trading",
};

type Account = {
  id: string;
  name: "Checking" | "Savings";
  balance: number;       // cents-safe in real impl; kept simple here
  apy: number;           // 0.005 => 0.50%
  href: string;
};

const accounts: Account[] = [
  { id: "chk", name: "Checking", balance: 131.26, apy: 0.005, href: "#" },
  { id: "svg", name: "Savings",  balance: 9258.71, apy: 0.038, href: "#"  },
];

const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

function formatUSD(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

export default function BankingPage() {
  return (
    <main className="px-4 py-6 md:px-8 lg:px-12 w-full max-w-6xl mx-auto 2xl:max-w-7xl 2xl:px-16">
      {/* Page Title */}
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Banking</h1>

      {/* Total Balance */}
      <div
        className={cn(
          "mt-4 md:mt-6",
          "text-4xl md:text-5xl lg:text-6xl font-semibold tabular-nums",
          "text-white drop-shadow-sm"
        )}
      >
        {formatUSD(totalBalance)}
      </div>

      {/* Accounts Card */}
      <section
        className={cn(
          "mt-6 md:mt-8",
          "rounded-2xl border border-white/10 bg-white/5 backdrop-blur",
          "shadow-[0_0_0_1px_rgba(180,112,255,0.06)_inset] relative"
        )}
      >
        {/* subtle glow bar */}
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"></div>

        <header className="px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-medium tracking-wide text-white/80">Accounts</h2>
        </header>

        <ul className="divide-y divide-white/10">
          {accounts.map((a) => (
            <li key={a.id}>
              <a
                href={a.href}
                className={cn(
                  "group flex items-start md:items-center gap-3 md:gap-4",
                  "px-5 py-4 transition",
                  "hover:bg-white/[0.04] focus:bg-white/[0.06]",
                  "rounded-2xl md:rounded-none md:rounded-[0] focus:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-purple-500/60"
                )}
              >
                {/* Left: Name + APY */}
                <div className="flex-1 min-w-0">
                  <div className="text-base md:text-lg font-semibold text-white">{a.name}</div>
                  <div className="text-xs md:text-sm text-white/60">
                    Current APY {(a.apy * 100).toFixed(2)}%
                  </div>
                </div>

                {/* Right: Amount + View */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-base md:text-lg font-semibold tabular-nums text-white">
                      {formatUSD(a.balance)}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-sm text-white/70 underline-offset-4",
                      "group-hover:underline group-focus:underline"
                    )}
                  >
                    View
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

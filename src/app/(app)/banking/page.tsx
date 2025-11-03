
"use client";

import { useState, useMemo } from 'react';
import { Metadata } from "next";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, parse } from 'date-fns';

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

type Transaction = {
  id: string;
  date: string; // "yyyy-MM-dd"
  description: string;
  type: "Deposit" | "ACH" | "Purchase" | "Withdrawal" | "Transfer";
  amount: number;
}

const transactions: Transaction[] = [
    { id: "txn_1", date: "2025-07-28", description: "Ghost Trading", type: "ACH", amount: -75.00 },
    { id: "txn_2", date: "2025-07-27", description: "Direct Deposit", type: "Deposit", amount: 1200.00 },
    { id: "txn_3", date: "2025-07-26", description: "Spooky Treats Co.", type: "Purchase", amount: -12.50 },
    { id: "txn_4", date: "2025-07-25", description: "ATM Withdrawal", type: "Withdrawal", amount: -40.00 },
    { id: "txn_5", date: "2025-07-25", description: "Ectoplasm Coffee", type: "Purchase", amount: -6.75 },
    { id: "txn_6", date: "2025-07-24", description: "Transfer to Savings", type: "Transfer", amount: -500.00 },
    { id: "txn_7", date: "2025-07-23", description: "Phantom Books", type: "Purchase", amount: -24.99 },
    { id: "txn_8", date: "2025-07-22", description: "Mobile Check Deposit", type: "Deposit", amount: 300.00 },
    { id: "txn_9", date: "2025-07-21", description: "Poltergeist Pizza", type: "Purchase", amount: -32.15 },
    { id: "txn_10", date: "2025-07-20", description: "ACH Payment - Car Loan", type: "ACH", amount: -350.80 },
    { id: "txn_11", date: "2025-07-19", description: "Spectre Streaming Service", type: "Purchase", amount: -15.99 },
    { id: "txn_12", date: "2025-07-15", description: "Zelle from Jane Doe", type: "Deposit", amount: 50.00 },
];

function formatUSD(n: number) {
  const isNegative = n < 0;
  const absoluteValue = Math.abs(n);
  const formatted = absoluteValue.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
  return isNegative ? `-${formatted}` : `+${formatted}`;
}

function formatUSDNoSign(n: number) {
    return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}


function formatDate(dateString: string) {
    const date = new Date(dateString + 'T00:00:00'); // Assume UTC if no timezone
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const RecentTransactions = () => {
    const [transactionType, setTransactionType] = useState('all');
    const [transactionDate, setTransactionDate] = useState<DateRange | undefined>();
    const [transactionSearch, setTransactionSearch] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const transactionTypes = useMemo(() => ['all', ...Array.from(new Set(transactions.map(tx => tx.type)))], []);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const typeMatch = transactionType === 'all' || tx.type.toLowerCase() === transactionType.toLowerCase();

            const dateMatch = !transactionDate?.from || (
                new Date(tx.date) >= transactionDate.from &&
                (!transactionDate.to || new Date(tx.date) <= transactionDate.to)
            );

            const searchMatch = !transactionSearch ||
                Object.values(tx).some(val =>
                    String(val).toLowerCase().includes(transactionSearch.toLowerCase())
                );

            return typeMatch && dateMatch && searchMatch;
        });
    }, [transactionType, transactionDate, transactionSearch]);
    
    const displayedTransactions = useMemo(() => {
        return isExpanded ? filteredTransactions : filteredTransactions.slice(0, 7);
    }, [filteredTransactions, isExpanded]);

    return (
        <section className="mt-8 md:mt-12 rounded-2xl bg-card">
            <header className="px-5 py-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-xl font-semibold text-white whitespace-nowrap">Recent Transactions</h2>
                 <div className="flex items-center gap-2">
                    <Select value={transactionType} onValueChange={setTransactionType}>
                        <SelectTrigger className="w-auto h-9 text-xs">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {transactionTypes.map(type => (
                                <SelectItem key={type} value={type}>{type === 'all' ? 'All Types' : type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                size="sm"
                                className="w-auto justify-start text-left font-normal h-9 text-xs"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {transactionDate?.from ? (
                                    transactionDate.to ? (
                                        <>
                                            {format(transactionDate.from, "LLL dd, y")} -{" "}
                                            {format(transactionDate.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(transactionDate.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>All Dates</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={transactionDate?.from}
                                selected={transactionDate}
                                onSelect={setTransactionDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                     <div className="relative sm:max-w-xs">
                        <Input
                            placeholder="Search..."
                            value={transactionSearch}
                            onChange={(e) => setTransactionSearch(e.target.value)}
                            className="h-9 w-full pl-8"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </header>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="py-3 px-5 text-left font-bold text-sm whitespace-nowrap text-muted-foreground">Date</th>
                            <th className="py-3 px-5 text-left font-bold text-sm whitespace-nowrap text-muted-foreground">Description</th>
                            <th className="py-3 px-5 text-left font-bold text-sm whitespace-nowrap text-muted-foreground">Type</th>
                            <th className="py-3 px-5 text-right font-bold text-sm whitespace-nowrap text-muted-foreground">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                      {displayedTransactions.map((t) => {
                          const isDebit = t.amount < 0;
                          return (
                              <tr key={t.id} className="transition-colors border-none hover:bg-white/5">
                                <td className="px-5 py-3 text-sm text-white/80">{formatDate(t.date)}</td>
                                <td className="px-5 py-3 text-sm font-semibold text-white">{t.description}</td>
                                <td className="px-5 py-3 text-sm text-white/80">{t.type}</td>
                                <td className={cn("px-5 py-3 text-right font-semibold tabular-nums", isDebit ? "text-white" : "text-[hsl(var(--confirm-green))]")}>
                                    {isDebit ? formatUSDNoSign(t.amount) : formatUSD(t.amount)}
                                </td>
                              </tr>
                          );
                      })}
                    </tbody>
                </table>
            </div>
             {filteredTransactions.length > 7 && (
                <div className="flex justify-center p-4">
                    <Button
                        variant="outline"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'See Less' : 'See More'}
                    </Button>
                </div>
            )}
        </section>
    );
};


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
        {formatUSDNoSign(totalBalance)}
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
                      {formatUSDNoSign(a.balance)}
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
      
      <RecentTransactions />
    </main>
  );
}

    
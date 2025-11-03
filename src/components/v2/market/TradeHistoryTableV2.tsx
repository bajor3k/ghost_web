
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTradeHistoryContext } from "@/contexts/TradeHistoryContext";
import { format, parseISO } from 'date-fns';
import type { TradeHistoryEntry, WidgetKey } from '@/types';
import { History, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Button } from '../../ui/button';
import { CardMenu } from '../CardMenu';
import { useToast } from '@/hooks/use-toast';

const WIDGETS = [
  { key: "chart" as WidgetKey, label: "Chart" },
  { key: "order" as WidgetKey, label: "Trading Card" },
  { key: "positions" as WidgetKey, label: "Positions" },
  { key: "orders" as WidgetKey, label: "Open Orders" },
  { key: "history" as WidgetKey, label: "History" },
  { key: "watchlist" as WidgetKey, label: "Watchlist" },
  { key: "screeners" as WidgetKey, label: "Screeners" },
  { key: "news" as WidgetKey, label: "News" },
  { key: "details" as WidgetKey, label: "Details" },
];

interface TradeHistoryTableProps {
  className?: string;
  syncedTickerSymbol: string | null;
  onDelete?: () => void;
  onAddWidget?: (widgetKey: WidgetKey) => void;
}

export function TradeHistoryTableV2({ className, syncedTickerSymbol, onDelete, onAddWidget }: TradeHistoryTableProps) {
  const { tradeHistory } = useTradeHistoryContext();
  const { toast } = useToast();
  
  const filteredHistory = React.useMemo(() => {
    const sortedHistory = [...tradeHistory].sort((a, b) => parseISO(b.filledTime).getTime() - parseISO(a.filledTime).getTime());
    if (syncedTickerSymbol) {
      return sortedHistory.filter(t => t.symbol === syncedTickerSymbol).slice(0, 20); // Show top 20 for symbol
    }
    return sortedHistory.slice(0, 20); // Show latest 20 overall
  }, [tradeHistory, syncedTickerSymbol]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
  }

  const showHeader = onDelete && onAddWidget;

  return (
    <div className={cn("h-full flex flex-col", className)}>
        {showHeader && (
            <CardHeader className="py-1 px-3 border-b border-white/10 h-8 flex-row items-center drag-handle cursor-move">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                  History
              </CardTitle>
              <div className="ml-auto flex items-center gap-1 no-drag">
                   <Popover>
                      <PopoverTrigger asChild>
                          <Button variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" onMouseDown={handleInteraction} onTouchStart={handleInteraction}>
                              <Plus size={16} />
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-1" onMouseDown={handleInteraction} onTouchStart={handleInteraction}>
                          <div className="flex flex-col">
                              {WIDGETS.map(w => (
                                  <Button 
                                      key={w.key}
                                      variant="ghost" 
                                      className="w-full justify-start text-xs h-8"
                                      onClick={() => onAddWidget(w.key)}
                                  >
                                      {w.label}
                                  </Button>
                              ))}
                          </div>
                      </PopoverContent>
                   </Popover>
                  <CardMenu onCustomize={() => toast({title: "Customize History..."})} onDelete={onDelete} />
              </div>
          </CardHeader>
        )}
      <div className="p-0 flex-1 overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-[1]">
            <TableRow>
              <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Symbol</TableHead>
              <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Side</TableHead>
              <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Qty</TableHead>
              <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Avg Price</TableHead>
              <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Type</TableHead>
              <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Time</TableHead>
              <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.length > 0 ? (
                filteredHistory.map((trade) => (
                  <TableRow key={trade.id} className="text-xs hover:bg-white/5">
                    <TableCell className="px-2 py-1.5 font-bold text-left">{trade.symbol}</TableCell>
                    <TableCell className="px-2 py-1.5 font-bold text-left">{trade.side}</TableCell>
                    <TableCell className="px-2 py-1.5 text-right font-bold">{trade.totalQty}</TableCell>
                    <TableCell className="px-2 py-1.5 text-right font-bold">${trade.averagePrice.toFixed(2)}</TableCell>
                    <TableCell className="px-2 py-1.5 font-bold text-left">{trade.orderType}</TableCell>
                    <TableCell className="px-2 py-1.5 font-bold text-left">{format(parseISO(trade.filledTime), "HH:mm:ss")}</TableCell>
                    <TableCell className="px-2 py-1.5 font-bold text-left">{trade.orderStatus}</TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-xs py-8 px-3">
                          <History className="mx-auto h-8 w-8 mb-2 opacity-50 text-muted-foreground" />
                          <p className="text-muted-foreground text-center">
                              No trade history {syncedTickerSymbol ? `for ${syncedTickerSymbol}` : 'available'}.
                          </p>
                      </div>
                  </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

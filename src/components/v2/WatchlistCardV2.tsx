
"use client"
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { initialMockStocks } from "@/app/(app)/trading/dashboard/mock-data";
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { CardMenu } from './CardMenu';
import { useToast } from '@/hooks/use-toast';
import type { WidgetKey } from '@/types';


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

interface WatchlistCardProps {
    className?: string;
    onSymbolSelect: (symbol: string) => void;
    selectedSymbol: string | null;
    onDelete?: () => void;
    onAddWidget?: (widgetKey: WidgetKey) => void;
}

const watchlistStocks = initialMockStocks.slice(0, 15);

const formatVolume = (volume?: number) => {
    if (volume === undefined || volume === null) return '—';
    // The mock data is in millions, so we multiply
    return (volume * 1_000_000).toLocaleString();
}

const formatShortFloat = (shortFloat?: number) => {
    if (shortFloat === undefined || shortFloat === null) return '—';
    return `${shortFloat.toFixed(2)}%`;
}

export const WatchlistCardV2: React.FC<WatchlistCardProps> = ({ className, onSymbolSelect, selectedSymbol, onDelete, onAddWidget }) => {
    const { toast } = useToast();

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
    }
    
    const showHeader = onDelete && onAddWidget;
    
    return (
        <div className={cn("h-full flex flex-col", className)}>
             {showHeader && (
                <CardHeader className="py-1 px-3 border-b border-white/10 h-8 flex-row items-center drag-handle cursor-move">
                    <CardTitle className="text-sm font-semibold text-muted-foreground">
                        Watchlist
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
                        <CardMenu onCustomize={() => toast({title: "Customize Watchlist..."})} onDelete={onDelete} />
                    </div>
                </CardHeader>
            )}
            <div className="flex-1 overflow-y-auto px-3 pb-3 pt-2">
                <Table>
                    <TableHeader className="sticky top-0 bg-card z-[1]">
                        <TableRow>
                            <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Symbol</TableHead>
                            <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Price</TableHead>
                            <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Volume</TableHead>
                            <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Short %</TableHead>
                            <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">% Change</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {watchlistStocks.map((stock) => (
                            <TableRow
                                key={stock.id}
                                className="cursor-pointer"
                                onClick={() => onSymbolSelect(stock.symbol)}
                                data-selected={selectedSymbol === stock.symbol}
                            >
                                <TableCell className="font-medium text-xs py-1.5 px-2">{stock.symbol}</TableCell>
                                <TableCell className="text-right text-xs py-1.5 px-2">{`$${stock.price.toFixed(2)}`}</TableCell>
                                <TableCell className="text-right text-xs py-1.5 px-2">{formatVolume(stock.volume)}</TableCell>
                                <TableCell className="text-right text-xs py-1.5 px-2">{formatShortFloat(stock.shortFloat)}</TableCell>
                                <TableCell className={cn("text-right text-xs py-1.5 px-2", stock.changePercent >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>
                                    {`${stock.changePercent.toFixed(2)}%`}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

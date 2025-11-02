
"use client";

import React from 'react';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PackageSearch, Plus } from 'lucide-react';
import type { OpenPosition, WidgetKey } from '@/types';
import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CardMenu } from './CardMenu';
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

interface OpenPositionsCardProps {
    className?: string;
    onDelete?: () => void;
    onAddWidget?: (widgetKey: WidgetKey) => void;
}

const PositionRow = ({ position, onClose }: { position: OpenPosition; onClose: (id: string) => void; }) => {
    const pnl = (position.currentPrice - position.entryPrice) * position.shares;
    const pnlPercent = ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100;
    const pnlColor = pnl >= 0 ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive';
    const totalCost = position.entryPrice * position.shares;

    const getSideBadgeClass = (side: OpenPosition['side']) => {
        switch(side) {
            case 'Long': return 'bg-[hsl(var(--confirm-green))] text-[hsl(var(--confirm-green-foreground))] hover:bg-[hsl(var(--confirm-green))]/90';
            case 'Sell': return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
            case 'Short': return 'bg-yellow-500 text-yellow-950 hover:bg-yellow-500/90';
            default: return 'bg-secondary';
        }
    };

    return (
        <TableRow key={position.id} className="text-xs hover:bg-white/5">
            <TableCell className="px-2 py-1.5 text-center">
                <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-6 px-2.5 text-xs font-bold rounded-md" 
                    onClick={() => onClose(position.id)}
                >
                    CLOSE
                </Button>
            </TableCell>
            <TableCell className="px-2 py-1.5 font-bold text-left">{position.symbol}</TableCell>
            <TableCell className="px-2 py-1.5 text-right font-bold">{position.shares}</TableCell>
            <TableCell className="px-2 py-1.5 text-right font-bold">${position.entryPrice.toFixed(2)}</TableCell>
            <TableCell className="px-2 py-1.5 text-right font-bold">${position.currentPrice.toFixed(2)}</TableCell>
            <TableCell className={cn("px-2 py-1.5 text-right font-bold", pnlColor)}>
                {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
            </TableCell>
            <TableCell className="px-2 py-1.5 text-left">
                <Badge className={cn("border-transparent text-xs px-1.5 py-px h-auto", getSideBadgeClass(position.side))}>
                    {position.side}
                </Badge>
            </TableCell>
            <TableCell className="px-2 py-1.5 text-right font-bold">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
        </TableRow>
    );
};

export function OpenPositionsCardV2({ className, onDelete, onAddWidget }: OpenPositionsCardProps) {
    const { openPositions, closePosition } = useOpenPositionsContext();
    const { toast } = useToast();

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
    }

    return (
        <div className={cn("h-full flex flex-col", className)}>
            {onDelete && onAddWidget && (
                 <CardHeader className="py-1 px-3 border-b border-white/10 h-8 flex-row items-center drag-handle cursor-move">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">
                      Positions
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
                      <CardMenu onCustomize={() => toast({title: "Customize Positions..."})} onDelete={onDelete} />
                  </div>
              </CardHeader>
            )}
            <div className="p-0 flex-1 overflow-y-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-card z-[1]">
                        <TableRow>
                            <TableHead className="text-xs h-7 px-2 text-center text-muted-foreground font-medium w-20">Action</TableHead>
                            <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Symbol</TableHead>
                            <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Qty</TableHead>
                            <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Avg Price</TableHead>
                            <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Last Price</TableHead>
                            <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Open P&L</TableHead>
                            <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Side</TableHead>
                            <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Total Cost</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {openPositions.length > 0 ? (
                            openPositions.map((position) => (
                                <PositionRow key={position.id} position={position} onClose={closePosition} />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center text-xs py-8 px-3">
                                        <PackageSearch className="mx-auto h-8 w-8 mb-2 opacity-50 text-muted-foreground" />
                                        <p className="text-muted-foreground text-center">No open positions.</p>
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

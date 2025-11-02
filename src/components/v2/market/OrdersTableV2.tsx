
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PackageSearch, XCircle, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import type { OrderActionType, OrderSystemType, WidgetKey } from '@/types';
import { CardMenu } from '../CardMenu';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
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

interface OpenOrder {
    id: string;
    action: 'Buy' | 'Sell' | 'Short' | 'Cover';
    symbol: string;
    side: 'Buy' | 'Sell';
    quantity: number;
    orderType: OrderSystemType;
    limitPrice?: number;
    status: 'Pending' | 'Executed' | 'Canceled';
    time: string;
}

const dummyOpenOrders: OpenOrder[] = [
    { id: 'ord_1', action: 'Buy', symbol: 'GOOGL', side: 'Buy', quantity: 10, orderType: 'Limit', limitPrice: 140.00, status: 'Pending', time: '09:42:11 AM' },
    { id: 'ord_2', action: 'Sell', symbol: 'AAPL', side: 'Sell', quantity: 50, orderType: 'Stop', limitPrice: 168.00, status: 'Pending', time: '10:02:30 AM' },
    { id: 'ord_3', action: 'Short', symbol: 'TSLA', side: 'Sell', quantity: 10, orderType: 'Market', status: 'Pending', time: '10:15:50 AM' },
];


interface OrdersTableProps {
  className?: string;
}

const getSideBadgeClass = (side: OpenOrder['side']) => {
    switch(side) {
        case 'Buy': return 'bg-[hsl(var(--confirm-green))] text-[hsl(var(--confirm-green-foreground))] hover:bg-[hsl(var(--confirm-green))]/90';
        case 'Sell': return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
        default: return 'bg-secondary';
    }
}

export function OrdersTableV2({ className }: OrdersTableProps) {
  const [openOrders, setOpenOrders] = React.useState(dummyOpenOrders);
  const { toast } = useToast();

  const cancelOrder = (id: string) => {
      setOpenOrders(prev => prev.filter(order => order.id !== id));
  }

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
  }

  const handleDelete = () => {
    toast({ title: 'This card cannot be deleted.' });
  };
  
  const handleAddWidget = (widgetKey: WidgetKey) => {
    toast({ title: `Add widget: ${widgetKey}` });
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
       <CardHeader className="py-1 px-3 border-b border-white/10 h-8 flex-row items-center drag-handle cursor-move">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
              Open Orders
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
                                  onClick={() => handleAddWidget(w.key)}
                              >
                                  {w.label}
                              </Button>
                          ))}
                      </div>
                  </PopoverContent>
               </Popover>
              <CardMenu onCustomize={() => toast({title: "Customize Open Orders..."})} onDelete={handleDelete} />
          </div>
      </CardHeader>
      <div className="p-0 flex-1 overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-[1]">
            <TableRow>
              <TableHead className="text-xs h-7 px-2 text-center text-muted-foreground font-medium w-16">Action</TableHead>
              <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Symbol</TableHead>
              <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Side</TableHead>
              <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Qty</TableHead>
              <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Order Type</TableHead>
              <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Limit/Stop</TableHead>
              <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Status</TableHead>
              <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {openOrders.length > 0 ? (
              openOrders.map((order) => (
                  <TableRow key={order.id} className="text-xs hover:bg-white/5">
                      <TableCell className="px-2 py-1.5 text-center w-16">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => cancelOrder(order.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                      </TableCell>
                      <TableCell className="px-2 py-1.5 font-bold text-left">{order.symbol}</TableCell>
                      <TableCell className="px-2 py-1.5 text-left">
                          <Badge className={cn("border-transparent text-xs px-1.5 py-px h-auto", getSideBadgeClass(order.side))}>
                              {order.side}
                          </Badge>
                      </TableCell>
                      <TableCell className="px-2 py-1.5 text-right font-bold">{order.quantity}</TableCell>
                      <TableCell className="px-2 py-1.5 text-left font-bold">{order.orderType}</TableCell>
                      <TableCell className="px-2 py-1.5 text-right font-bold">{order.limitPrice ? `$${order.limitPrice.toFixed(2)}` : '—'}</TableCell>
                      <TableCell className="px-2 py-1.5 text-left font-bold text-yellow-400">{order.status}</TableCell>
                      <TableCell className="px-2 py-1.5 text-left font-bold">{order.time}</TableCell>
                  </TableRow>
              ))
            ) : (
              <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                     <div className="flex flex-col items-center justify-center text-xs py-8 px-3">
                      <PackageSearch className="mx-auto h-8 w-8 mb-2 opacity-50 text-muted-foreground" />
                      <p className="text-muted-foreground text-center">No open orders currently.</p>
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

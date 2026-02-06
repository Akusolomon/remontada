'use client';

import React, { useEffect } from "react"

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useData, GameSale } from '@/lib/data-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface GameSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId?: string;
  sale?: GameSale;
  onSuccess?: () => void;
}

const PS_STATIONS = ['PS4-1', 'PS4-2', 'PS4-3', 'PS4-4'] as const;
const PAYMENT_METHODS = ['CASH', 'MOBILE'] as const;

export function GameSaleModal({
  open,
  onOpenChange,
  editingId,
  sale,
  onSuccess,
}: GameSaleModalProps) {


  const [psStation, setPsStation] = useState<string>(sale?.consoleId || 'PS4-1');
   const [pay, setPay] = useState<string>(sale?.paymentMethod || 'CASH');
  const [gamesPlayed, setGamesPlayed] = useState(sale?.gamesPlayed.toString() || '1');
  const [pricePerGame, setPricePerGame] = useState(sale?.pricePerGame.toString() || '10');
  const [notes, setNotes] = useState(sale?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
  if (open) {
    if (editingId && sale) {
      setPsStation(sale.consoleId || 'PS4-1');
      setPay(sale.paymentMethod || 'CASH');
      setGamesPlayed(sale.gamesPlayed?.toString() || '1');
      setPricePerGame(sale.pricePerGame?.toString() || '10');
      setNotes(sale.notes || '');
      
    } else {
      resetForm();
    }
  }
}, [open, editingId, sale])

  const totalAmount = Number(gamesPlayed) * Number(pricePerGame);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const saleData = {
        consoleId: psStation as 'PS4-1' | 'PS4-2' | 'PS4-3' | 'PS4-4',
        gamesPlayed: Number(gamesPlayed),
        pricePerGame: Number(pricePerGame),
        totalAmount,
        createdAt: sale?.createdAt || new Date(),
        notes: notes || undefined,
        paymentMethod: pay as 'CASH' | 'MOBILE',
      };
   

      if (editingId && sale) {
        const data = await fetch(`https://remontadaa.onrender.com/game/${editingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(saleData),
        });
      } else {
        await fetch('https://remontadaa.onrender.com/game/add', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(saleData),
        });
      }

      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPsStation('PS4');
    setGamesPlayed('1');
    setPricePerGame('10');
    setNotes('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingId ? 'Edit Game Sale' : 'Add Game Sale'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ps-station">PS Station</Label>
            <Select value={psStation} onValueChange={setPsStation}>
              <SelectTrigger id="ps-station">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PS_STATIONS.map((station) => (
                  <SelectItem key={station} value={station}>
                    {station}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="games-played">Games Played</Label>
            <Input
              id="games-played"
              type="number"
              min="1"
              value={gamesPlayed}
              onChange={(e) => setGamesPlayed(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="price-per-game">Price per Game (Birr)</Label>
            <Input
              id="price-per-game"
              type="number"
              min="0"
              step="0.01"
              value={pricePerGame}
              onChange={(e) => setPricePerGame(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Total Amount (Birr)</Label>
            <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm font-semibold">
              {totalAmount.toFixed(2)}
            </div>
          </div>
              <div>
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={pay} onValueChange={setPay}>
              <SelectTrigger id="payment-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this sale..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Add Sale'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import React, { useEffect } from "react"

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {  Expense } from '@/lib/data-context';
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

interface ExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId?: string;
  expense?: Expense;
  onSuccess?: () => void;
}

const EXPENSE_CATEGORIES = [
  'ELECTRICITY',
  'RENT',
  'CONTROLLER',
  'MAINTENANCE',
"SALARY",
  'OTHER',
  'REPAIR',
  'EQUIPMENT',
  'INTERNET'
] as const;

export function ExpenseModal({
  open,
  onOpenChange,
  editingId,
  expense,
  onSuccess,
}: ExpenseModalProps) {
  const { admin } = useAuth();

  const [category, setCategory] = useState<string>(expense?.category || 'OTHER');
  const [amount, setAmount] = useState(expense?.amount.toString() || '');
  const [description, setDescription] = useState(expense?.note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (open) {
      if (editingId && expense) {
        setCategory(expense.category || 'OTHER');
        setAmount(expense.amount.toString());
        setDescription(expense.note || '');
      } else {
        resetForm();
      }
    }
  }, [open, editingId, expense])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const expenseData = {
        category: category as Expense['category'],
        amount: Number(amount),
        note: description || undefined,
      };

      if (editingId && expense) {
          const data = await fetch(`https://remontadaa.onrender.com/expenses/${editingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(expenseData),
        });
      } else {
             await fetch('https://remontadaa.onrender.com/expenses/add', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(expenseData),
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
    setCategory('Other');
    setAmount('');
    setDescription('');
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
            {editingId ? 'Edit Expense' : 'Add Expense'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount (Birr)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this expense..."
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
            <Button type="submit" disabled={isSubmitting || !amount}>
              {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

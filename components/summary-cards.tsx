'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameSale, Expense } from '@/lib/data-context';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface SummaryCardsProps {
  gameDa: any
  expenseData: any[];
  gameSale: any[];
}

export function SummaryCards({ gameDa, gameSale, expenseData }: SummaryCardsProps) {
  const totalIncome = gameDa.income | 0
  const totalExpense = gameDa.expense | 0
  const profit = gameDa.profit | 0

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalIncome} Birr</div>
          <p className="text-xs text-muted-foreground">
            {gameSale.length} game sales
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalExpense} Birr</div>
          <p className="text-xs text-muted-foreground">
            {expenseData.length} transactions
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Profit</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${profit >= 0 ? 'text-primary' : 'text-red-600'}`}>
            {profit} Birr
          </div>
          <p className="text-xs text-muted-foreground">
            {profit >= 0 ? 'Positive' : 'Negative'} margin
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { GameSale, Expense } from '@/lib/data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardChartsProps {
  gameSales: any[];
  expenses: any[];
  dateRange: { from: Date; to: Date };
}

export function DashboardCharts({ gameSales,expenses }: DashboardChartsProps) {
  // Filter data by date range
  const filteredSales = gameSales

  const filteredExpenses = expenses
 
  // Prepare data for Income vs Expense (Line chart)
  const incomeVsExpenseData = [] as any[];
  const dateMap = new Map();
  filteredSales.forEach((sale) => {
    const date = new Date(sale.createdAt).toLocaleDateString();
    if (!dateMap.has(date)) {
      dateMap.set(date, { date, income: 0, expense: 0 });
    }
    dateMap.get(date).income += sale.totalAmount;
  });
  

  filteredExpenses.forEach((expense) => {
    const date = new Date(expense.createdAt).toLocaleDateString();
    if (!dateMap.has(date)) {
      dateMap.set(date, { date, income: 0, expense: 0 });
    }
    dateMap.get(date).expense += expense.amount;
  });
  incomeVsExpenseData.push(...dateMap.values());

  // Prepare data for Profit by Day
  const profitByDayData = incomeVsExpenseData.map((item) => ({
    ...item,
    profit: item.income - item.expense,
  }));

  // Prepare data for Expense Category Breakdown (Pie chart)
  const expenseByCategoryData = [] as any[];
  const categoryMap = new Map();

  filteredExpenses.forEach((expense) => {
    if (!categoryMap.has(expense.category)) {
      categoryMap.set(expense.category, 0);
    }
    categoryMap.set(expense.category, categoryMap.get(expense.category) + expense.amount);
  });

  categoryMap.forEach((value, category) => {
    expenseByCategoryData.push({ name: category, value });
  });

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Income vs Expense Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Income vs Expense Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {incomeVsExpenseData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incomeVsExpenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip
                  formatter={(value) => `${value} Birr`}
                  contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Profit by Day Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Profit</CardTitle>
        </CardHeader>
        <CardContent>
          {profitByDayData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitByDayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip
                  formatter={(value) => `${value} Birr`}
                  contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                />
                <Bar
                  dataKey="profit"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Expense Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Expense Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {expenseByCategoryData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No expense data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseByCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value} Birr`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseByCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} Birr`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { DateFilters, DateRange } from '@/components/date-filters';
import { SummaryCards } from '@/components/summary-cards';
import { GameSalesTable } from '@/components/game-sales-table';
import { ExpensesTable } from '@/components/expenses-table';
import { AuditLogComponent } from '@/components/audit-log';
import { DashboardCharts } from '@/components/dashboard-charts';
import { GameSaleModal } from '@/components/game-sale-modal';
import { ExpenseModal } from '@/components/expense-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { set } from 'date-fns';

export default function DashboardPage() {
 
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const handleRefresh = async () => {
  await handleDateRangeChange(dateRange); 
};

  const [gameSaleModalOpen, setGameSaleModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gameDa, setgameDa] = useState();
  const [expenseStat, setExpense]= useState();
    const [auditStat, setAuditStat]= useState();

    const [gameSaleStat, setGameSale]= useState();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

 useEffect(() => {
    const fetchData = async () => {
      try {
        handleDateRangeChange({from:new Date(new Date().setHours(0,0,0,0)),to:new Date()})
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData()
  },[refreshTrigger]);


  const triggerRefresh = () => {
  setRefreshTrigger(prev => prev + 1);
};

// const handleDateRangeChange = async (newRange: DateRange) => {
//     setIsLoading(true);
//     const token = localStorage.getItem('token');
    
//     try {
//       const response = await fetch(
//         `http://localhost:3000/expenses/financial/byDate?from=${newRange.from.toISOString()}&to=${newRange.to.toISOString()}`, 
//         {
//           method: "GET",
//           headers: { 
//             "Content-Type": "application/json", 
//             "Authorization": `Bearer ${token}` 
//           },
//         }
//       );
//       const expense = await fetch(
//         `http://localhost:3000/expenses?from=${newRange.from.toISOString()}&to=${newRange.to.toISOString()}`, 
//         {
//           method: "GET",
//           headers: { 
//             "Content-Type": "application/json", 
//             "Authorization": `Bearer ${token}` 
//           },
//         }
//       );
//       const gameSales = await fetch(
//         `http://localhost:3000/game?from=${newRange.from.toISOString()}&to=${newRange.to.toISOString()}`, 
//         {
//           method: "GET",
//           headers: { 
//             "Content-Type": "application/json", 
//             "Authorization": `Bearer ${token}` 
//           },
//         }
//       );
//       const data = await response.json();
//       const expenseData = await expense.json()
//       const gameSaleData = await gameSales.json()
//       setgameDa(data);
//       setGameSale(gameSaleData)
//       setExpense(expenseData)
//       setDateRange(newRange);
//     } catch (error) {
//       console.error("Filter error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };
  const handleDateRangeChange = async (newRange: DateRange) => {
  setIsLoading(true);
  const token = localStorage.getItem('token');
  const headers = { 
    "Content-Type": "application/json", 
    "Authorization": `Bearer ${token}` 
  };

  try {
    // Fire all requests simultaneously
    const [finRes, expRes, gameRes, auditRes] = await Promise.all([
      fetch(`http://localhost:3000/expenses/financial/byDate?from=${newRange.from.toISOString()}&to=${newRange.to.toISOString()}`, { headers }),
      fetch(`http://localhost:3000/expenses/expense/byDate?from=${newRange.from.toISOString()}&to=${newRange.to.toISOString()}`, { headers }),
      fetch(`http://localhost:3000/game/game/byDate?from=${newRange.from.toISOString()}&to=${newRange.to.toISOString()}`, { headers }),
      fetch(`http://localhost:3000/audit/from-to/${newRange.from.toISOString()}/${newRange.to.toISOString()}`, { headers })
    ]);

    // Parse all responses
    const financialData = await finRes.json();
    const expenseData = await expRes.json();
    const gameSaleData = await gameRes.json();
    const auditData = await auditRes.json();

    // Update all states at once to trigger a single re-render
    console.log("Financial Data:", financialData);
    console.log("Expense Data:", expenseData);
    console.log("Game Sale Data:", gameSaleData);
    setgameDa(financialData);
    setExpense(expenseData);
    setAuditStat(auditData);
    setGameSale(gameSaleData);
    setDateRange(newRange);

  } catch (error) {
    console.error("Filter error:", error);
  } finally {
    setIsLoading(false);
  }
};
  if (!gameDa ) {
    return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>;
  }
  
  return (
    
    <div className="min-h-screen bg-background">
      
       
      <DashboardHeader />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Date Filters */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Manage your game zone finances
              </p>
            </div>
          </div>

          <DateFilters onDateRangeChange={handleDateRangeChange} />

          {/* Summary Cards */}
          {/* TODO  FETCH DATA IN HERE */}
          <SummaryCards gameDa={gameDa} gameSale={gameSaleStat || []} expenseData={expenseStat || []} />

          {/* Quick Actions */}
               {/* TODO  ADD DATA DATA IN HERE */}
          <div className="flex gap-4">
            <Button
              onClick={() => setGameSaleModalOpen(true)}
              className="gap-2"
              size="lg"
            >
              <Plus className="h-4 w-4" />
              Add Game Sale
            </Button>
            <Button
              onClick={() => setExpenseModalOpen(true)}
              variant="outline"
              className="gap-2"
              size="lg"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </div>

        {gameSaleStat && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4">Analytics</h3>
                <DashboardCharts
                  gameSales={gameSaleStat}  // Default to empty array if null
                  expenses={expenseStat || []} 
                  dateRange={dateRange}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Game Sales</h3>
                <GameSalesTable gameSales={gameSaleStat || []} dateRange={dateRange} onRefresh={handleRefresh} />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Expenses</h3>
                <ExpensesTable expenses={expenseStat || []} dateRange={dateRange}  onRefresh={handleRefresh}/>
              </div>
            </>
          )}

      
          
<AuditLogComponent 
  audit={auditStat || []} 
  dateRange={dateRange} // Pass the dateRange prop
/>
        </div>
      </main>

      {/* Modals */}
      <GameSaleModal
        open={gameSaleModalOpen}
        onOpenChange={setGameSaleModalOpen}
        onSuccess={triggerRefresh}
      />
      <ExpenseModal
        open={expenseModalOpen}
        onOpenChange={setExpenseModalOpen}
        onSuccess={triggerRefresh}
      />
    </div>
  );
}

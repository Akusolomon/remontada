'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface GameSale {
  _id: string;
  consoleId: 'PS4-1' | 'PS4-2' | 'PS4-3' | 'PS4-4';
  gamesPlayed: number;
  pricePerGame: number;
  totalAmount: number;
  recordedBy: string;
  createdAt: Date;
  notes?: string;
  paymentMethod?: 'CASH' | 'MOBILE';
}

export interface Expense {
  _id: string;
  category: 'ELECTRICITY' | 'RENT' | 'CONTROLLER' | 'MAINTENANCE' | 'SALARY' | 'OTHER' | 'REPAIR' | 'EQUIPMENT' | 'INTERNET';
  amount: number;
  note?: string;
  recordedBy: string;
  createdAt: Date;
}




export interface AuditLog {
  _id: string;
  action: 'Create' | 'Update' | 'Delete';
  entityType: 'GameSale' | 'Expense';
  recordId: string;
  performedBy: string;
  timestamp: Date;
  before?: any;
  after?: any;
  createdAt?: Date;
}

interface DataContextType {
  gameSales: GameSale[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  addGameSale: (sale: Omit<GameSale, 'id'>) => void;
  updateGameSale: (id: string, sale: Omit<GameSale, 'id'>) => void;
  deleteGameSale: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data with comprehensive sample data
const generateMockSales = () => {
  const today = new Date();
  const sales: GameSale[] = [];
  let id = 1;

  // Generate sales for the past 30 days
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Random 1-3 sales per day
    const salesPerDay = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < salesPerDay; j++) {
      const stations: ('PS4-1' | 'PS4-2' | 'PS4-3' | 'PS4-4')[] = ['PS4-1', 'PS4-2', 'PS4-3', 'PS4-4'];
      const station = stations[Math.floor(Math.random() * stations.length)];
      const gamesPlayed = Math.floor(Math.random() * 8) + 2;
      const pricePerGame = 10;

      sales.push({
        _id: id.toString(),
        consoleId: station,
        gamesPlayed,
        pricePerGame,
        totalAmount: gamesPlayed * pricePerGame,
        recordedBy: ['Admin1', 'Admin2', 'Admin3'][Math.floor(Math.random() * 3)],
        createdAt: date,
        notes: Math.random() > 0.5 ? 'Regular sale' : undefined,
      });
      id++;
    }
  }

  return sales;
};

const generateMockExpenses = () => {
  const today = new Date();
  const expenses: Expense[] = [];
  let id = 1;

  // Generate expenses for the past 30 days
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Random 0-2 expenses per day
    const expensesPerDay = Math.floor(Math.random() * 2);
    for (let j = 0; j < expensesPerDay; j++) {
      const categories: ('ELECTRICITY' | 'INTERNET' | 'RENT' | 'SALARY' | 'REPAIR' | 'EQUIPMENT' | 'CONTROLLER' | 'MAINTENANCE' | 'OTHER')[] = [
        'ELECTRICITY',
        'INTERNET',
        'RENT',
        'SALARY',
        'REPAIR',
        'EQUIPMENT',
        'CONTROLLER',
        'MAINTENANCE',
        'OTHER',
      ];
      const category = categories[Math.floor(Math.random() * categories.length)];

      let amount = 500;
      let description = '';

      switch (category) {
        case 'ELECTRICITY':
          amount = Math.floor(Math.random() * 300) + 200;
          description = 'Electricity bill';
          break;
        case 'INTERNET':
          amount = Math.floor(Math.random() * 200) + 100;
          description = 'Internet bill';
          break;
        case 'RENT':
          amount = 3000;
          description = 'Monthly office rent';
          break;
        case 'SALARY':
          amount = Math.floor(Math.random() * 10000) + 5000;
          description = 'Employee salary';
          break;
        case 'REPAIR':
          amount = Math.floor(Math.random() * 300) + 150;
          description = `${Math.floor(Math.random() * 3) + 1} controller(s)`;
          break;
        case 'EQUIPMENT':
          amount = Math.floor(Math.random() * 500) + 200;
          description = 'Equipment maintenance';
          break;
        case 'OTHER':
          amount = Math.floor(Math.random() * 200) + 50;
          description = 'Miscellaneous expense';
          break;
      }

      expenses.push({
        _id: id.toString(),
        category,
        amount,
        note: description,
        recordedBy: ['Admin1', 'Admin2', 'Admin3'][Math.floor(Math.random() * 3)],
        createdAt: date,
      });
      id++;
    }
  }

  return expenses;
};

const MOCK_GAME_SALES = generateMockSales();
const MOCK_EXPENSES = generateMockExpenses();

const generateMockAuditLogs = () => {
  const logs: AuditLog[] = [];
  let id = 1;

  // Generate audit logs for sales
  MOCK_GAME_SALES.slice(0, 10).forEach((sale) => {
    logs.push({
      _id: id.toString(),
      action: 'Create',
      entityType: 'GameSale',
      recordId: sale._id,
      performedBy: sale.recordedBy,
      timestamp: sale.createdAt,
      after: sale,
    });
    id++;
  });

  // Generate audit logs for expenses
  MOCK_EXPENSES.slice(0, 10).forEach((expense) => {
    logs.push({
      _id: id.toString(),
      action: 'Create',
      entityType: 'Expense',
      recordId: expense._id,
      performedBy: expense.recordedBy,
      timestamp: expense.createdAt,
      after: expense,
    });
    id++;
  });

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const MOCK_AUDIT_LOGS = generateMockAuditLogs();

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [gameSales, setGameSales] = useState<GameSale[]>(MOCK_GAME_SALES);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);


  const addGameSale = (sale: Omit<GameSale, 'id'>) => {
    const id = Date.now().toString();
    const newSale = { ...sale, id };
    setGameSales([...gameSales, newSale]);
    setAuditLogs([
      ...auditLogs,
      {
        _id: Date.now().toString(),
        action: 'Create',
        entityType: 'GameSale',
        recordId: id,
      performedBy: sale.recordedBy,
        timestamp: new Date(),
        after: newSale,
      },
    ]);
  };

  const updateGameSale = (id: string, sale: Omit<GameSale, 'id'>) => {
    const oldSale = gameSales.find((s) => s._id === id);
    setGameSales(gameSales.map((s) => (s._id === id ? { ...sale, id } : s)));
    if (oldSale) {
      setAuditLogs([
        ...auditLogs,
        {
          _id: Date.now().toString(),
          action: 'Update',
          entityType: 'GameSale',
          recordId: id,
          performedBy: sale.recordedBy,
          timestamp: new Date(),
          before: oldSale,
          after: { ...sale, id },
        },
      ]);
    }
  };

  const deleteGameSale = (id: string) => {
    const sale = gameSales.find((s) => s._id === id);
    setGameSales(gameSales.filter((s) => s._id !== id));
    if (sale) {
      setAuditLogs([
        ...auditLogs,
        {
          _id: Date.now().toString(),
          action: 'Delete',
          entityType: 'GameSale',
          recordId: id,
          performedBy: sale.recordedBy,
          timestamp: new Date(),
          before: sale,
        },
      ]);
    }
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const id = Date.now().toString();
    const newExpense = { ...expense, id };
    setExpenses([...expenses, newExpense]);
    setAuditLogs([
      ...auditLogs,
      {
        _id: Date.now().toString(),
        action: 'Create',
        entityType: 'Expense',
        recordId: id,
        performedBy: expense.recordedBy,
        timestamp: new Date(),
        after: newExpense,
      },
    ]);
  };

  const updateExpense = (id: string, expense: Omit<Expense, '_id'>) => {
    const oldExpense = expenses.find((e) => e._id === id);
    setExpenses(expenses.map((e) => (e._id === id ? { ...expense, _id: id } : e)));
    if (oldExpense) {
      setAuditLogs([
        ...auditLogs,
        {
          _id: Date.now().toString(),
          action: 'Update',
          entityType: 'Expense',
          recordId: id,
          performedBy: expense.recordedBy,
          timestamp: new Date(),
          before: oldExpense,
          after: { ...expense, id },
        },
      ]);
    }
  };

  const deleteExpense = (id: string) => {
    const expense = expenses.find((e) => e._id === id);
    setExpenses(expenses.filter((e) => e._id !== id));
    if (expense) {
      setAuditLogs([
        ...auditLogs,
        {
          _id: Date.now().toString(),
          action: 'Delete',
          entityType: 'Expense',
          recordId: id,
          performedBy: expense.recordedBy,
          timestamp: new Date(),
          before: expense,
        },
      ]);
    }
  };

  return (
    <DataContext.Provider
      value={{
        gameSales,
        expenses,
        auditLogs,
        addGameSale,
        updateGameSale,
        deleteGameSale,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}

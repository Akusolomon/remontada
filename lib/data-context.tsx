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

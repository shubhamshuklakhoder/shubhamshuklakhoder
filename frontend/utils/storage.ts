import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Entertainment' | 'Health' | 'Other';
  date: string; // ISO format
  createdAt: string;
}

const EXPENSES_KEY = 'expenses';

export const storageService = {
  // Get all expenses
  getExpenses: (): Expense[] => {
    try {
      const data = storage.getString(EXPENSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  },

  // Save a new expense
  saveExpense: (expense: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    try {
      const expenses = storageService.getExpenses();
      const newExpense: Expense = {
        ...expense,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      expenses.push(newExpense);
      storage.set(EXPENSES_KEY, JSON.stringify(expenses));
      return newExpense;
    } catch (error) {
      console.error('Error saving expense:', error);
      throw error;
    }
  },

  // Update an existing expense
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>): void => {
    try {
      const expenses = storageService.getExpenses();
      const index = expenses.findIndex(exp => exp.id === id);
      if (index !== -1) {
        expenses[index] = { ...expenses[index], ...updates };
        storage.set(EXPENSES_KEY, JSON.stringify(expenses));
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },

  // Delete an expense
  deleteExpense: (id: string): void => {
    try {
      const expenses = storageService.getExpenses();
      const filtered = expenses.filter(exp => exp.id !== id);
      storage.set(EXPENSES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  },

  // Get expense by ID
  getExpenseById: (id: string): Expense | undefined => {
    try {
      const expenses = storageService.getExpenses();
      return expenses.find(exp => exp.id === id);
    } catch (error) {
      console.error('Error getting expense by ID:', error);
      return undefined;
    }
  },
};

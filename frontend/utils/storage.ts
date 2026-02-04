import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Entertainment' | 'Health' | 'Other';
  date: string; // ISO format
  createdAt: string;
}

const EXPENSES_KEY = '@expenses';

export const storageService = {
  // Get all expenses
  getExpenses: async (): Promise<Expense[]> => {
    try {
      const data = await AsyncStorage.getItem(EXPENSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  },

  // Save a new expense
  saveExpense: async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
    try {
      const expenses = await storageService.getExpenses();
      const newExpense: Expense = {
        ...expense,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      expenses.push(newExpense);
      await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
      return newExpense;
    } catch (error) {
      console.error('Error saving expense:', error);
      throw error;
    }
  },

  // Update an existing expense
  updateExpense: async (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>): Promise<void> => {
    try {
      const expenses = await storageService.getExpenses();
      const index = expenses.findIndex(exp => exp.id === id);
      if (index !== -1) {
        expenses[index] = { ...expenses[index], ...updates };
        await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },

  // Delete an expense
  deleteExpense: async (id: string): Promise<void> => {
    try {
      const expenses = await storageService.getExpenses();
      const filtered = expenses.filter(exp => exp.id !== id);
      await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  },

  // Get expense by ID
  getExpenseById: async (id: string): Promise<Expense | undefined> => {
    try {
      const expenses = await storageService.getExpenses();
      return expenses.find(exp => exp.id === id);
    } catch (error) {
      console.error('Error getting expense by ID:', error);
      return undefined;
    }
  },
};

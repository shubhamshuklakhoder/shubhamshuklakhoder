import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storageService, Expense } from '../utils/storage';
import { formatExpenseDate, formatCurrency } from '../utils/dateUtils';
import { CATEGORIES } from '../constants/categories';
import { startOfDay, startOfWeek, startOfMonth, parseISO } from 'date-fns';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type TimeFilter = 'today' | 'week' | 'month';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [refreshing, setRefreshing] = useState(false);

  const loadExpenses = async () => {
    const allExpenses = await storageService.getExpenses();
    // Sort by date descending (latest first)
    const sorted = allExpenses.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setExpenses(sorted);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // Refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = router.subscribe?.(() => {
      loadExpenses();
    });
    return unsubscribe;
  }, [router]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    let filterDate: Date;

    switch (timeFilter) {
      case 'today':
        filterDate = startOfDay(now);
        break;
      case 'week':
        filterDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        break;
      case 'month':
        filterDate = startOfMonth(now);
        break;
      default:
        return expenses;
    }

    return expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      return expenseDate >= filterDate;
    });
  }, [expenses, timeFilter]);

  const totalExpense = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.icon || '📝';
  };

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.color || '#FCBAD3';
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      style={styles.expenseCard}
      onPress={() => router.push(`/edit-expense?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.expenseCardLeft}>
        <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
          <Text style={styles.categoryEmoji}>{getCategoryIcon(item.category)}</Text>
        </View>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.expenseCategory}>{item.category}</Text>
          <Text style={styles.expenseDate}>{formatExpenseDate(item.date)}</Text>
        </View>
      </View>
      <View style={styles.expenseCardRight}>
        <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={80} color="#9CA3AF" />
      <Text style={styles.emptyStateText}>No expenses yet</Text>
      <Text style={styles.emptyStateSubtext}>Tap the + button to add your first expense</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Simple Expense Tracker</Text>
      </View>

      {/* Total Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Expenses</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(totalExpense)}</Text>
        
        {/* Time Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, timeFilter === 'today' && styles.filterButtonActive]}
            onPress={() => setTimeFilter('today')}
          >
            <Text style={[styles.filterText, timeFilter === 'today' && styles.filterTextActive]}>
              Today
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, timeFilter === 'week' && styles.filterButtonActive]}
            onPress={() => setTimeFilter('week')}
          >
            <Text style={[styles.filterText, timeFilter === 'week' && styles.filterTextActive]}>
              This Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, timeFilter === 'month' && styles.filterButtonActive]}
            onPress={() => setTimeFilter('month')}
          >
            <Text style={[styles.filterText, timeFilter === 'month' && styles.filterTextActive]}>
              This Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expense List */}
      <FlatList
        data={filteredExpenses}
        renderItem={renderExpenseItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredExpenses.length === 0 && styles.listContainerEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(insets.bottom + 20, 20) }]}
        onPress={() => router.push('/add-expense')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 120, // Extra space for FAB
  },
  listContainerEmpty: {
    flex: 1,
  },
  expenseCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  expenseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  expenseCardRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

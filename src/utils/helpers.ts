// ユーティリティ関数集

import { v4 as uuidv4 } from 'uuid';

// 日付関連のヘルパー
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
  });
};

export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return getDateString(date);
};

// ID生成
export const generateId = (): string => {
  return uuidv4();
};

// 重量表示のフォーマット
export const formatWeight = (weight: number, unit: 'kg' | 'lbs' = 'kg'): string => {
  return `${weight}${unit}`;
};

// 総挙上量の計算
export const calculateVolume = (weight: number, reps: number): number => {
  return weight * reps;
};

// セット表示のフォーマット
export const formatSet = (reps: number, weight: number): string => {
  return `${reps}回 × ${formatWeight(weight)}`;
};

// 時間フォーマット（秒を分:秒に変換）
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// カラー関連（進捗トレンドや優先度に応じた色）
export const getProgressColor = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up': return '#22c55e'; // green
    case 'down': return '#ef4444'; // red
    case 'stable': return '#64748b'; // gray
    default: return '#64748b';
  }
};

export const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
  switch (priority) {
    case 'high': return '#dc2626'; // red
    case 'medium': return '#f59e0b'; // amber
    case 'low': return '#10b981'; // emerald
    default: return '#64748b';
  }
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    '胸': '#ef4444', // red
    '背中': '#3b82f6', // blue
    '脚': '#22c55e', // green
    '肩': '#f59e0b', // amber
    '腕': '#8b5cf6', // violet
    'コア': '#06b6d4', // cyan
  };
  return colors[category] || '#64748b';
};

// データ検証
export const isValidWeight = (weight: number): boolean => {
  return weight > 0 && weight <= 1000; // 0kg超～1000kg以下
};

export const isValidReps = (reps: number): boolean => {
  return reps > 0 && reps <= 100; // 1回～100回
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && !!dateString.match(/^\d{4}-\d{2}-\d{2}$/);
};

// 配列操作ヘルパー
export const groupBy = <T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortByDate = <T extends { date: string }>(array: T[], descending = true): T[] => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return descending ? dateB - dateA : dateA - dateB;
  });
};

// 統計計算ヘルパー
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

export const calculateMax = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return Math.max(...numbers);
};

export const calculateTotal = (numbers: number[]): number => {
  return numbers.reduce((sum, num) => sum + num, 0);
};

// ローカルストレージのサイズ計算
export const getStorageSize = (): { used: number; total: number } => {
  let used = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length;
    }
  }
  
  // ローカルストレージの一般的な制限は5MB
  const total = 5 * 1024 * 1024; // 5MB in bytes
  return { used, total };
};

// エラーハンドリング
export const handleStorageError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.name === 'QuotaExceededError') {
      return 'ストレージの容量が不足しています。古いデータを削除してください。';
    }
    return error.message;
  }
  return '予期しないエラーが発生しました。';
};

// デバウンス（検索機能などで使用）
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
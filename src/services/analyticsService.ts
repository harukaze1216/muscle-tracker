// 統計分析とAI提案機能

import { WorkoutSession, Exercise, ExerciseStats, ExerciseSuggestion, ExerciseTemplate } from '../types/workout';
import { DataService } from './dataService';

export class AnalyticsService {
  // データキャッシュ
  private static cachedSessions: WorkoutSession[] = [];
  private static cachedTemplates: ExerciseTemplate[] = [];
  private static lastCacheUpdate: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5分

  // キャッシュされたセッションを取得
  static getCachedSessions(): WorkoutSession[] {
    // キャッシュが古い場合は空の配列を返す（外部で更新が必要）
    if (Date.now() - this.lastCacheUpdate > this.CACHE_DURATION) {
      return [];
    }
    return this.cachedSessions;
  }

  // キャッシュの更新
  static async updateCache(): Promise<void> {
    try {
      const [sessions, templates] = await Promise.all([
        DataService.getAllWorkoutSessions(),
        DataService.getExerciseTemplates(),
      ]);
      
      this.cachedSessions = sessions;
      this.cachedTemplates = templates;
      this.lastCacheUpdate = Date.now();
    } catch (error) {
      console.error('キャッシュ更新エラー:', error);
    }
  }

  // キャッシュされたテンプレートを取得
  static getCachedTemplates(): ExerciseTemplate[] {
    return this.cachedTemplates;
  }
  // 種目別統計情報の取得
  static getExerciseStats(exerciseName: string): ExerciseStats | null {
    // キャッシュされたデータを使用（非同期処理を避けるため）
    const sessions = this.getCachedSessions().filter(session =>
      session.exercises.some(ex => ex.name === exerciseName)
    );
    if (sessions.length === 0) return null;

    const allSets = sessions.flatMap(session =>
      session.exercises
        .filter(ex => ex.name === exerciseName)
        .flatMap(ex => ex.sets)
    );

    if (allSets.length === 0) return null;

    const maxWeight = Math.max(...allSets.map(set => set.weight));
    const totalVolume = allSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
    const lastPerformed = sessions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      .date;

    // 進捗トレンドの分析（過去4回の平均重量を比較）
    const recentSessions = sessions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);

    let progressTrend: 'up' | 'down' | 'stable' = 'stable';
    if (recentSessions.length >= 2) {
      const recentAvg = this.calculateAverageWeight(recentSessions.slice(0, 2), exerciseName);
      const olderAvg = this.calculateAverageWeight(recentSessions.slice(2), exerciseName);
      
      if (recentAvg > olderAvg * 1.05) progressTrend = 'up';
      else if (recentAvg < olderAvg * 0.95) progressTrend = 'down';
    }

    // カテゴリを推定（テンプレートから取得）
    const templates = this.getCachedTemplates();
    const template = templates.find(t => t.name === exerciseName);
    const category = template?.category || '不明';

    return {
      exerciseName,
      category,
      maxWeight,
      totalVolume,
      lastPerformed,
      progressTrend,
    };
  }

  private static calculateAverageWeight(sessions: WorkoutSession[], exerciseName: string): number {
    const sets = sessions.flatMap(session =>
      session.exercises
        .filter(ex => ex.name === exerciseName)
        .flatMap(ex => ex.sets)
    );
    
    if (sets.length === 0) return 0;
    return sets.reduce((sum, set) => sum + set.weight, 0) / sets.length;
  }

  // 今日のおすすめ種目を提案
  static suggestTodaysExercises(): ExerciseSuggestion[] {
    const today = new Date().toISOString().split('T')[0];
    const pastWeekSessions = this.getSessionsInLastDays(7);
    const templates = this.getCachedTemplates();
    
    // 過去1週間の部位別トレーニング頻度を分析
    const categoryFrequency = this.analyzeCategoryFrequency(pastWeekSessions);
    
    // 各部位の最後のトレーニング日を取得
    const lastTrainedByCategory = this.getLastTrainedByCategory(pastWeekSessions);
    
    const suggestions: ExerciseSuggestion[] = [];
    
    // 1. 長期間トレーニングしていない部位を優先
    const categories = ['胸', '背中', '脚', '肩', '腕'];
    
    categories.forEach(category => {
      const lastTrained = lastTrainedByCategory[category];
      const frequency = categoryFrequency[category] || 0;
      const daysSinceLastTrained = lastTrained ? 
        Math.floor((new Date(today).getTime() - new Date(lastTrained).getTime()) / (1000 * 60 * 60 * 24)) : 
        999;
      
      // 3日以上間隔が空いている、または頻度が週1回以下の部位を提案
      if (daysSinceLastTrained >= 3 || frequency <= 1) {
        const categoryTemplates = templates.filter(t => t.category === category);
        
        categoryTemplates.forEach(template => {
          const stats = this.getExerciseStats(template.name);
          let priority: 'high' | 'medium' | 'low' = 'medium';
          let reason = `${category}を${daysSinceLastTrained}日間トレーニングしていません`;
          
          if (daysSinceLastTrained >= 7) {
            priority = 'high';
            reason = `${category}を1週間以上トレーニングしていません`;
          } else if (stats?.progressTrend === 'up') {
            priority = 'high';
            reason = `${template.name}で良い進捗が見られています`;
          }
          
          suggestions.push({
            exercise: template,
            reason,
            priority,
            suggestedWeight: stats ? Math.round(stats.maxWeight * 0.85) : undefined,
            suggestedReps: this.getSuggestedReps(template.difficulty),
          });
        });
      }
    });
    
    // 2. 今日すでにトレーニングしている場合は、バランスを考慮
    const todaysSessions = StorageService.getWorkoutSessionsByDateRange(today, today);
    if (todaysSessions.length > 0) {
      const todaysCategories = new Set(
        todaysSessions.flatMap(session => 
          session.exercises.map(ex => {
            const template = templates.find(t => t.name === ex.name);
            return template?.category || '不明';
          })
        )
      );
      
      // 今日やっていない部位を提案
      const untrainedToday = categories.filter(cat => !todaysCategories.has(cat));
      untrainedToday.forEach(category => {
        const categoryTemplates = templates.filter(t => t.category === category);
        categoryTemplates.slice(0, 2).forEach(template => {
          const stats = this.getExerciseStats(template.name);
          suggestions.push({
            exercise: template,
            reason: `今日は${category}をまだトレーニングしていません`,
            priority: 'medium',
            suggestedWeight: stats ? Math.round(stats.maxWeight * 0.85) : undefined,
            suggestedReps: this.getSuggestedReps(template.difficulty),
          });
        });
      });
    }
    
    // 優先度とカテゴリでソートして重複を削除
    const uniqueSuggestions = suggestions.reduce((acc, current) => {
      const existing = acc.find(s => s.exercise.id === current.exercise.id);
      if (!existing || current.priority === 'high') {
        return acc.filter(s => s.exercise.id !== current.exercise.id).concat(current);
      }
      return acc;
    }, [] as ExerciseSuggestion[]);
    
    return uniqueSuggestions
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 6); // 最大6つの提案
  }

  private static getSessionsInLastDays(days: number): WorkoutSession[] {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // キャッシュされたセッションから期間内のものを取得
    const sessions = this.getCachedSessions();
    return sessions.filter(session => 
      session.date >= startDate && session.date <= endDate
    );
  }

  private static analyzeCategoryFrequency(sessions: WorkoutSession[]): Record<string, number> {
    const templates = this.getCachedTemplates();
    const frequency: Record<string, number> = {};
    
    sessions.forEach(session => {
      const categoriesInSession = new Set<string>();
      session.exercises.forEach(exercise => {
        const template = templates.find(t => t.name === exercise.name);
        if (template) {
          categoriesInSession.add(template.category);
        }
      });
      
      categoriesInSession.forEach(category => {
        frequency[category] = (frequency[category] || 0) + 1;
      });
    });
    
    return frequency;
  }

  private static getLastTrainedByCategory(sessions: WorkoutSession[]): Record<string, string> {
    const templates = this.getCachedTemplates();
    const lastTrained: Record<string, string> = {};
    
    // 日付でソート（新しい順）
    const sortedSessions = sessions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    sortedSessions.forEach(session => {
      session.exercises.forEach(exercise => {
        const template = templates.find(t => t.name === exercise.name);
        if (template && !lastTrained[template.category]) {
          lastTrained[template.category] = session.date;
        }
      });
    });
    
    return lastTrained;
  }

  private static getSuggestedReps(difficulty: string): number {
    switch (difficulty) {
      case 'beginner': return 12;
      case 'intermediate': return 10;
      case 'advanced': return 8;
      default: return 10;
    }
  }

  // 週間統計の取得
  static getWeeklyStats(): {
    totalWorkouts: number;
    totalVolume: number;
    mostTrainedCategory: string;
    streak: number;
  } {
    const sessions = this.getSessionsInLastDays(7);
    const totalVolume = sessions.reduce((sum, session) =>
      sum + session.exercises.reduce((exerciseSum, exercise) =>
        exerciseSum + exercise.sets.reduce((setSum, set) =>
          setSum + (set.weight * set.reps), 0
        ), 0
      ), 0
    );

    const categoryFreq = this.analyzeCategoryFrequency(sessions);
    const mostTrainedCategory = Object.entries(categoryFreq)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'なし';

    // 連続トレーニング日数を計算
    const streak = this.calculateStreak();

    return {
      totalWorkouts: sessions.length,
      totalVolume,
      mostTrainedCategory,
      streak,
    };
  }

  private static calculateStreak(): number {
    const allSessions = this.getCachedSessions()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 30; i++) { // 過去30日をチェック
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasWorkout = allSessions.some(session => session.date === dateStr);
      
      if (hasWorkout) {
        streak++;
      } else if (streak > 0) {
        break; // 連続記録が途切れた
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  }
}

export default AnalyticsService;
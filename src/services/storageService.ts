// ローカルストレージを使用したデータ永続化サービス

import { WorkoutSession, ExerciseTemplate, UserSettings } from '../types/workout';

const STORAGE_KEYS = {
  WORKOUT_SESSIONS: 'muscle_tracker_workout_sessions',
  EXERCISE_TEMPLATES: 'muscle_tracker_exercise_templates',
  USER_SETTINGS: 'muscle_tracker_user_settings',
} as const;

export class StorageService {
  // ワークアウトセッション関連
  // 全てのワークアウトセッションを取得（エイリアス）
  static getAllWorkoutSessions(): WorkoutSession[] {
    return this.getWorkoutSessions();
  }

  // 単一のワークアウトセッションを取得
  static getWorkoutSession(sessionId: string): WorkoutSession | null {
    const sessions = this.getWorkoutSessions();
    return sessions.find(session => session.id === sessionId) || null;
  }

  // セッションを更新
  static updateWorkoutSession(session: WorkoutSession): void {
    const sessions = this.getWorkoutSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index !== -1) {
      sessions[index] = session;
      this.saveWorkoutSessions(sessions);
    } else {
      // セッションが存在しない場合は新規作成
      this.saveWorkoutSession(session);
    }
  }

  static getWorkoutSessions(): WorkoutSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUT_SESSIONS);
      if (!data) return [];
      
      const sessions = JSON.parse(data);
      // Date オブジェクトを復元
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load workout sessions:', error);
      return [];
    }
  }

  static saveWorkoutSession(session: WorkoutSession): void {
    try {
      const sessions = this.getWorkoutSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = { ...session, updatedAt: new Date() };
      } else {
        sessions.push(session);
      }
      
      localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save workout session:', error);
      throw new Error('ワークアウトの保存に失敗しました');
    }
  }

  static deleteWorkoutSession(sessionId: string): void {
    try {
      const sessions = this.getWorkoutSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(filteredSessions));
    } catch (error) {
      console.error('Failed to delete workout session:', error);
      throw new Error('ワークアウトの削除に失敗しました');
    }
  }

  static getWorkoutSessionsByDateRange(startDate: string, endDate: string): WorkoutSession[] {
    const sessions = this.getWorkoutSessions();
    return sessions.filter(session => 
      session.date >= startDate && session.date <= endDate
    );
  }

  static getWorkoutSessionsByExercise(exerciseName: string): WorkoutSession[] {
    const sessions = this.getWorkoutSessions();
    return sessions.filter(session =>
      session.exercises.some(exercise => exercise.name === exerciseName)
    );
  }

  // 種目テンプレート関連
  static getExerciseTemplates(): ExerciseTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXERCISE_TEMPLATES);
      return data ? JSON.parse(data) : this.getDefaultExerciseTemplates();
    } catch (error) {
      console.error('Failed to load exercise templates:', error);
      return this.getDefaultExerciseTemplates();
    }
  }

  static saveExerciseTemplate(template: ExerciseTemplate): void {
    try {
      const templates = this.getExerciseTemplates();
      const existingIndex = templates.findIndex(t => t.id === template.id);
      
      if (existingIndex >= 0) {
        templates[existingIndex] = template;
      } else {
        templates.push(template);
      }
      
      localStorage.setItem(STORAGE_KEYS.EXERCISE_TEMPLATES, JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save exercise template:', error);
      throw new Error('種目テンプレートの保存に失敗しました');
    }
  }

  // デフォルトの種目テンプレート
  private static getDefaultExerciseTemplates(): ExerciseTemplate[] {
    const defaultTemplates: ExerciseTemplate[] = [
      // 胸
      { id: '1', name: 'ベンチプレス', category: '胸', targetMuscles: ['大胸筋', '三角筋前部', '上腕三頭筋'], equipment: 'バーベル', difficulty: 'intermediate' },
      { id: '2', name: 'ダンベルベンチプレス', category: '胸', targetMuscles: ['大胸筋', '三角筋前部'], equipment: 'ダンベル', difficulty: 'beginner' },
      { id: '3', name: 'プッシュアップ', category: '胸', targetMuscles: ['大胸筋', '三角筋前部', '上腕三頭筋'], equipment: '自重', difficulty: 'beginner' },
      
      // 背中
      { id: '4', name: 'デッドリフト', category: '背中', targetMuscles: ['広背筋', '僧帽筋', '脊柱起立筋'], equipment: 'バーベル', difficulty: 'advanced' },
      { id: '5', name: 'ラットプルダウン', category: '背中', targetMuscles: ['広背筋', '菱形筋'], equipment: 'マシン', difficulty: 'beginner' },
      { id: '6', name: 'ダンベルロウ', category: '背中', targetMuscles: ['広背筋', '僧帽筋中部'], equipment: 'ダンベル', difficulty: 'intermediate' },
      
      // 脚
      { id: '7', name: 'スクワット', category: '脚', targetMuscles: ['大腿四頭筋', '大臀筋', 'ハムストリングス'], equipment: 'バーベル', difficulty: 'intermediate' },
      { id: '8', name: 'レッグプレス', category: '脚', targetMuscles: ['大腿四頭筋', '大臀筋'], equipment: 'マシン', difficulty: 'beginner' },
      { id: '9', name: 'ルーマニアンデッドリフト', category: '脚', targetMuscles: ['ハムストリングス', '大臀筋'], equipment: 'バーベル', difficulty: 'intermediate' },
      
      // 肩
      { id: '10', name: 'ショルダープレス', category: '肩', targetMuscles: ['三角筋', '上腕三頭筋'], equipment: 'ダンベル', difficulty: 'beginner' },
      { id: '11', name: 'サイドレイズ', category: '肩', targetMuscles: ['三角筋中部'], equipment: 'ダンベル', difficulty: 'beginner' },
      
      // 腕
      { id: '12', name: 'バーベルカール', category: '腕', targetMuscles: ['上腕二頭筋'], equipment: 'バーベル', difficulty: 'beginner' },
      { id: '13', name: 'トライセプスプッシュダウン', category: '腕', targetMuscles: ['上腕三頭筋'], equipment: 'マシン', difficulty: 'beginner' },
    ];

    // 初回のみデフォルトテンプレートを保存
    localStorage.setItem(STORAGE_KEYS.EXERCISE_TEMPLATES, JSON.stringify(defaultTemplates));
    return defaultTemplates;
  }

  // ユーザー設定関連
  static getUserSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      return data ? JSON.parse(data) : this.getDefaultUserSettings();
    } catch (error) {
      console.error('Failed to load user settings:', error);
      return this.getDefaultUserSettings();
    }
  }

  static saveUserSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save user settings:', error);
      throw new Error('設定の保存に失敗しました');
    }
  }

  private static getDefaultUserSettings(): UserSettings {
    return {
      preferredUnits: 'kg',
      restTimerDefault: 90, // 90秒
      weeklyGoal: 3,
    };
  }

  // データのエクスポート・インポート
  static exportData(): string {
    const data = {
      workoutSessions: this.getWorkoutSessions(),
      exerciseTemplates: this.getExerciseTemplates(),
      userSettings: this.getUserSettings(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.workoutSessions) {
        localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(data.workoutSessions));
      }
      if (data.exerciseTemplates) {
        localStorage.setItem(STORAGE_KEYS.EXERCISE_TEMPLATES, JSON.stringify(data.exerciseTemplates));
      }
      if (data.userSettings) {
        localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(data.userSettings));
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('データのインポートに失敗しました');
    }
  }

  // データ全削除
  static clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw new Error('データの削除に失敗しました');
    }
  }

  // ストレージ使用状況を取得
  static getStorageInfo(): { used: number; total: number } {
    try {
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      
      // ローカルストレージの一般的な制限は5MB
      const total = 5 * 1024 * 1024; // 5MB in bytes
      return { used, total };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, total: 0 };
    }
  }
}

export default StorageService;
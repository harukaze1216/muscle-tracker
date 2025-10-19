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
      if (!data) {
        const sampleSessions = this.getSampleWorkoutSessions();
        this.saveWorkoutSessions(sampleSessions);
        return sampleSessions;
      }

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

  // 複数のワークアウトセッションを一括保存
  static saveWorkoutSessions(sessions: WorkoutSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save workout sessions:', error);
      throw new Error('ワークアウトセッションの保存に失敗しました');
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

  // サンプルのワークアウトセッション
  private static getSampleWorkoutSessions(): WorkoutSession[] {
    return [
      {
        id: 'sample-session-1',
        date: '2024-03-01',
        exercises: [
          {
            id: 'sample-ex-1',
            name: 'ベンチプレス',
            category: '胸',
            sets: [
              { id: 'sample-set-1', reps: 10, weight: 60 },
              { id: 'sample-set-2', reps: 8, weight: 65 },
              { id: 'sample-set-3', reps: 6, weight: 70 },
            ],
          },
          {
            id: 'sample-ex-2',
            name: 'ショルダープレス',
            category: '肩',
            sets: [
              { id: 'sample-set-4', reps: 12, weight: 14 },
              { id: 'sample-set-5', reps: 10, weight: 16 },
              { id: 'sample-set-6', reps: 8, weight: 18 },
            ],
          },
        ],
        notes: 'フォームを意識して胸を追い込みました。',
        duration: 70,
        createdAt: new Date('2024-03-01T08:30:00'),
        updatedAt: new Date('2024-03-01T09:40:00'),
      },
      {
        id: 'sample-session-2',
        date: '2024-03-03',
        exercises: [
          {
            id: 'sample-ex-3',
            name: 'スクワット',
            category: '脚',
            sets: [
              { id: 'sample-set-7', reps: 10, weight: 80 },
              { id: 'sample-set-8', reps: 8, weight: 90 },
              { id: 'sample-set-9', reps: 6, weight: 100 },
            ],
          },
          {
            id: 'sample-ex-4',
            name: 'ルーマニアンデッドリフト',
            category: '脚',
            sets: [
              { id: 'sample-set-10', reps: 12, weight: 60 },
              { id: 'sample-set-11', reps: 10, weight: 70 },
              { id: 'sample-set-12', reps: 8, weight: 80 },
            ],
          },
        ],
        notes: '脚メインの日。フォームとレンジを意識。',
        duration: 85,
        createdAt: new Date('2024-03-03T07:45:00'),
        updatedAt: new Date('2024-03-03T09:10:00'),
      },
      {
        id: 'sample-session-3',
        date: '2024-03-05',
        exercises: [
          {
            id: 'sample-ex-5',
            name: 'ラットプルダウン',
            category: '背中',
            sets: [
              { id: 'sample-set-13', reps: 12, weight: 50 },
              { id: 'sample-set-14', reps: 10, weight: 55 },
              { id: 'sample-set-15', reps: 8, weight: 60 },
            ],
          },
          {
            id: 'sample-ex-6',
            name: 'ダンベルロウ',
            category: '背中',
            sets: [
              { id: 'sample-set-16', reps: 12, weight: 24 },
              { id: 'sample-set-17', reps: 10, weight: 26 },
              { id: 'sample-set-18', reps: 8, weight: 28 },
            ],
          },
          {
            id: 'sample-ex-7',
            name: 'バーベルカール',
            category: '腕',
            sets: [
              { id: 'sample-set-19', reps: 12, weight: 30 },
              { id: 'sample-set-20', reps: 10, weight: 32 },
              { id: 'sample-set-21', reps: 8, weight: 34 },
            ],
          },
        ],
        notes: '背中と腕のコンビネーション。最後にパンプ感あり。',
        duration: 80,
        createdAt: new Date('2024-03-05T19:00:00'),
        updatedAt: new Date('2024-03-05T20:20:00'),
      },
    ];
  }
}

export default StorageService;

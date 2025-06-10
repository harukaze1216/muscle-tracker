// 筋トレ記録のデータ型定義

export interface WorkoutSet {
  id: string;
  reps: number;        // レップ数
  weight: number;      // 重量(kg)
  restTime?: number;   // 休憩時間(秒) - 将来の拡張用
}

export interface Exercise {
  id: string;
  name: string;        // 種目名（例：ダンベルベンチプレス）
  category: string;    // カテゴリ（例：胸、背中、脚）
  sets: WorkoutSet[];  // セット情報の配列
}

export interface WorkoutSession {
  id: string;
  date: string;        // YYYY-MM-DD形式
  exercises: Exercise[];
  notes?: string;      // メモ（調子や疲労度）
  duration?: number;   // ワークアウト時間(分) - 将来の拡張用
  createdAt: Date;
  updatedAt: Date;
}

// 種目提案用のデータ型
export interface ExerciseTemplate {
  id: string;
  name: string;
  category: string;
  targetMuscles: string[];  // 対象筋肉群
  equipment?: string;       // 使用器具
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description?: string;
}

// 統計情報用の型
export interface ExerciseStats {
  exerciseName: string;
  category: string;
  maxWeight: number;
  totalVolume: number;     // 総挙上量
  lastPerformed: string;   // 最後に実施した日付
  progressTrend: 'up' | 'down' | 'stable';
}

// 種目提案の結果型
export interface ExerciseSuggestion {
  exercise: ExerciseTemplate;
  reason: string;          // 提案理由
  priority: 'high' | 'medium' | 'low';
  suggestedWeight?: number;
  suggestedReps?: number;
}

// ユーザー設定
export interface UserSettings {
  name?: string;
  preferredUnits: 'kg' | 'lbs';
  restTimerDefault: number;    // デフォルト休憩時間(秒)
  weeklyGoal?: number;         // 週間目標ワークアウト回数
}
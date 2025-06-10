// Firestore を使用したデータ永続化サービス

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { WorkoutSession, ExerciseTemplate, UserSettings } from '../types/workout';

// FirestoreにはDateオブジェクトをTimestampとして保存
interface FirestoreWorkoutSession extends Omit<WorkoutSession, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class FirestoreService {
  // コレクション名
  private static readonly COLLECTIONS = {
    WORKOUT_SESSIONS: 'workoutSessions',
    EXERCISE_TEMPLATES: 'exerciseTemplates',
    USER_SETTINGS: 'userSettings',
  } as const;

  // ========== ワークアウトセッション関連 ==========

  // 全てのワークアウトセッションを取得（エイリアス）
  static async getAllWorkoutSessions(): Promise<WorkoutSession[]> {
    return this.getWorkoutSessions();
  }

  // 単一のワークアウトセッションを取得
  static async getWorkoutSession(sessionId: string): Promise<WorkoutSession | null> {
    try {
      const docRef = doc(db, this.COLLECTIONS.WORKOUT_SESSIONS, sessionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as FirestoreWorkoutSession;
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Failed to load workout session:', error);
      throw new Error('ワークアウトセッションの読み込みに失敗しました');
    }
  }

  // ワークアウトセッションを更新
  static async updateWorkoutSession(session: WorkoutSession): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTIONS.WORKOUT_SESSIONS, session.id);
      const sessionData = {
        date: session.date,
        exercises: session.exercises,
        notes: session.notes,
        duration: session.duration,
        createdAt: Timestamp.fromDate(session.createdAt),
        updatedAt: Timestamp.fromDate(new Date()),
      };
      
      await updateDoc(docRef, sessionData);
    } catch (error) {
      console.error('Failed to update workout session:', error);
      throw new Error('ワークアウトセッションの更新に失敗しました');
    }
  }

  static async getWorkoutSessions(): Promise<WorkoutSession[]> {
    try {
      const sessionsRef = collection(db, this.COLLECTIONS.WORKOUT_SESSIONS);
      const q = query(sessionsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const sessions: WorkoutSession[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreWorkoutSession;
        sessions.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });
      
      return sessions;
    } catch (error) {
      console.error('Failed to load workout sessions:', error);
      throw new Error('ワークアウトセッションの読み込みに失敗しました');
    }
  }

  static async saveWorkoutSession(session: WorkoutSession): Promise<void> {
    try {
      const sessionData = {
        date: session.date,
        exercises: session.exercises,
        notes: session.notes,
        duration: session.duration,
        createdAt: Timestamp.fromDate(session.createdAt),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      if (session.id && session.id.length > 0) {
        // 既存セッションの更新
        const sessionRef = doc(db, this.COLLECTIONS.WORKOUT_SESSIONS, session.id);
        await updateDoc(sessionRef, sessionData);
      } else {
        // 新規セッションの作成
        const sessionsRef = collection(db, this.COLLECTIONS.WORKOUT_SESSIONS);
        const docRef = await addDoc(sessionsRef, sessionData);
        session.id = docRef.id;
      }
    } catch (error) {
      console.error('Failed to save workout session:', error);
      throw new Error('ワークアウトセッションの保存に失敗しました');
    }
  }

  static async deleteWorkoutSession(sessionId: string): Promise<void> {
    try {
      const sessionRef = doc(db, this.COLLECTIONS.WORKOUT_SESSIONS, sessionId);
      await deleteDoc(sessionRef);
    } catch (error) {
      console.error('Failed to delete workout session:', error);
      throw new Error('ワークアウトセッションの削除に失敗しました');
    }
  }

  static async getWorkoutSessionsByDateRange(startDate: string, endDate: string): Promise<WorkoutSession[]> {
    try {
      const sessionsRef = collection(db, this.COLLECTIONS.WORKOUT_SESSIONS);
      const q = query(
        sessionsRef,
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const sessions: WorkoutSession[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreWorkoutSession;
        sessions.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });
      
      return sessions;
    } catch (error) {
      console.error('Failed to load workout sessions by date range:', error);
      throw new Error('期間指定でのワークアウトセッション読み込みに失敗しました');
    }
  }

  static async getWorkoutSessionsByExercise(exerciseName: string): Promise<WorkoutSession[]> {
    try {
      const sessionsRef = collection(db, this.COLLECTIONS.WORKOUT_SESSIONS);
      // Firestoreでは配列内の検索にarray-containsを使用
      // ただし、複雑なクエリのため、全データを取得してフィルタリング
      const querySnapshot = await getDocs(sessionsRef);
      
      const sessions: WorkoutSession[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreWorkoutSession;
        const session = {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        };
        
        // 指定された種目が含まれているかチェック
        if (session.exercises.some(exercise => exercise.name === exerciseName)) {
          sessions.push(session);
        }
      });
      
      return sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Failed to load workout sessions by exercise:', error);
      throw new Error('種目別ワークアウトセッション読み込みに失敗しました');
    }
  }

  // ========== 種目テンプレート関連 ==========

  static async getExerciseTemplates(): Promise<ExerciseTemplate[]> {
    try {
      const templatesRef = collection(db, this.COLLECTIONS.EXERCISE_TEMPLATES);
      const querySnapshot = await getDocs(templatesRef);
      
      const templates: ExerciseTemplate[] = [];
      querySnapshot.forEach((doc) => {
        templates.push({
          id: doc.id,
          ...doc.data(),
        } as ExerciseTemplate);
      });
      
      // テンプレートがない場合はデフォルトテンプレートを作成
      if (templates.length === 0) {
        return await this.createDefaultExerciseTemplates();
      }
      
      return templates;
    } catch (error) {
      console.error('Failed to load exercise templates:', error);
      return await this.createDefaultExerciseTemplates();
    }
  }

  static async saveExerciseTemplate(template: ExerciseTemplate): Promise<void> {
    try {
      if (template.id && template.id.length > 0) {
        // 既存テンプレートの更新
        const templateRef = doc(db, this.COLLECTIONS.EXERCISE_TEMPLATES, template.id);
        const templateData = {
          name: template.name,
          category: template.category,
          targetMuscles: template.targetMuscles,
          equipment: template.equipment,
          difficulty: template.difficulty,
          description: template.description,
        };
        await updateDoc(templateRef, templateData);
      } else {
        // 新規テンプレートの作成
        const templatesRef = collection(db, this.COLLECTIONS.EXERCISE_TEMPLATES);
        const templateData = {
          name: template.name,
          category: template.category,
          targetMuscles: template.targetMuscles,
          equipment: template.equipment,
          difficulty: template.difficulty,
          description: template.description,
        };
        const docRef = await addDoc(templatesRef, templateData);
        template.id = docRef.id;
      }
    } catch (error) {
      console.error('Failed to save exercise template:', error);
      throw new Error('種目テンプレートの保存に失敗しました');
    }
  }

  private static async createDefaultExerciseTemplates(): Promise<ExerciseTemplate[]> {
    const defaultTemplates: Omit<ExerciseTemplate, 'id'>[] = [
      // 胸
      { name: 'ベンチプレス', category: '胸', targetMuscles: ['大胸筋', '三角筋前部', '上腕三頭筋'], equipment: 'バーベル', difficulty: 'intermediate' },
      { name: 'ダンベルベンチプレス', category: '胸', targetMuscles: ['大胸筋', '三角筋前部'], equipment: 'ダンベル', difficulty: 'beginner' },
      { name: 'プッシュアップ', category: '胸', targetMuscles: ['大胸筋', '三角筋前部', '上腕三頭筋'], equipment: '自重', difficulty: 'beginner' },
      
      // 背中
      { name: 'デッドリフト', category: '背中', targetMuscles: ['広背筋', '僧帽筋', '脊柱起立筋'], equipment: 'バーベル', difficulty: 'advanced' },
      { name: 'ラットプルダウン', category: '背中', targetMuscles: ['広背筋', '菱形筋'], equipment: 'マシン', difficulty: 'beginner' },
      { name: 'ダンベルロウ', category: '背中', targetMuscles: ['広背筋', '僧帽筋中部'], equipment: 'ダンベル', difficulty: 'intermediate' },
      
      // 脚
      { name: 'スクワット', category: '脚', targetMuscles: ['大腿四頭筋', '大臀筋', 'ハムストリングス'], equipment: 'バーベル', difficulty: 'intermediate' },
      { name: 'レッグプレス', category: '脚', targetMuscles: ['大腿四頭筋', '大臀筋'], equipment: 'マシン', difficulty: 'beginner' },
      { name: 'ルーマニアンデッドリフト', category: '脚', targetMuscles: ['ハムストリングス', '大臀筋'], equipment: 'バーベル', difficulty: 'intermediate' },
      
      // 肩
      { name: 'ショルダープレス', category: '肩', targetMuscles: ['三角筋', '上腕三頭筋'], equipment: 'ダンベル', difficulty: 'beginner' },
      { name: 'サイドレイズ', category: '肩', targetMuscles: ['三角筋中部'], equipment: 'ダンベル', difficulty: 'beginner' },
      
      // 腕
      { name: 'バーベルカール', category: '腕', targetMuscles: ['上腕二頭筋'], equipment: 'バーベル', difficulty: 'beginner' },
      { name: 'トライセプスプッシュダウン', category: '腕', targetMuscles: ['上腕三頭筋'], equipment: 'マシン', difficulty: 'beginner' },
    ];

    try {
      const batch = writeBatch(db);
      const templatesRef = collection(db, this.COLLECTIONS.EXERCISE_TEMPLATES);
      
      const createdTemplates: ExerciseTemplate[] = [];
      
      for (const template of defaultTemplates) {
        const docRef = doc(templatesRef);
        batch.set(docRef, template);
        createdTemplates.push({
          ...template,
          id: docRef.id,
        });
      }
      
      await batch.commit();
      return createdTemplates;
    } catch (error) {
      console.error('Failed to create default exercise templates:', error);
      throw new Error('デフォルト種目テンプレートの作成に失敗しました');
    }
  }

  // ========== ユーザー設定関連 ==========

  static async getUserSettings(): Promise<UserSettings> {
    try {
      // ユーザー設定は単一ドキュメントとして管理
      const settingsRef = doc(db, this.COLLECTIONS.USER_SETTINGS, 'default');
      const docSnap = await getDoc(settingsRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserSettings;
      } else {
        return this.getDefaultUserSettings();
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
      return this.getDefaultUserSettings();
    }
  }

  static async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTIONS.USER_SETTINGS, 'default');
      const settingsData = {
        preferredUnits: settings.preferredUnits,
        restTimerDefault: settings.restTimerDefault,
        weeklyGoal: settings.weeklyGoal,
      };
      await updateDoc(settingsRef, settingsData);
    } catch (error) {
      console.error('Failed to save user settings:', error);
      throw new Error('ユーザー設定の保存に失敗しました');
    }
  }

  private static getDefaultUserSettings(): UserSettings {
    return {
      preferredUnits: 'kg',
      restTimerDefault: 90,
      weeklyGoal: 3,
    };
  }

  // ========== データの一括操作 ==========

  static async exportData(): Promise<string> {
    try {
      const [sessions, templates, settings] = await Promise.all([
        this.getWorkoutSessions(),
        this.getExerciseTemplates(),
        this.getUserSettings(),
      ]);

      const data = {
        workoutSessions: sessions,
        exerciseTemplates: templates,
        userSettings: settings,
        exportDate: new Date().toISOString(),
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('データのエクスポートに失敗しました');
    }
  }

  static async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      const batch = writeBatch(db);

      // ワークアウトセッションのインポート
      if (data.workoutSessions && Array.isArray(data.workoutSessions)) {
        const sessionsRef = collection(db, this.COLLECTIONS.WORKOUT_SESSIONS);
        
        for (const session of data.workoutSessions) {
          const docRef = doc(sessionsRef);
          const sessionData = {
            ...session,
            createdAt: Timestamp.fromDate(new Date(session.createdAt)),
            updatedAt: Timestamp.fromDate(new Date(session.updatedAt)),
          };
          batch.set(docRef, sessionData);
        }
      }

      // 種目テンプレートのインポート
      if (data.exerciseTemplates && Array.isArray(data.exerciseTemplates)) {
        const templatesRef = collection(db, this.COLLECTIONS.EXERCISE_TEMPLATES);
        
        for (const template of data.exerciseTemplates) {
          const docRef = doc(templatesRef);
          batch.set(docRef, template);
        }
      }

      // ユーザー設定のインポート
      if (data.userSettings) {
        const settingsRef = doc(db, this.COLLECTIONS.USER_SETTINGS, 'default');
        batch.set(settingsRef, data.userSettings);
      }

      await batch.commit();
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('データのインポートに失敗しました');
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      const batch = writeBatch(db);

      // 各コレクションのドキュメントを取得して削除
      const collections = [
        this.COLLECTIONS.WORKOUT_SESSIONS,
        this.COLLECTIONS.EXERCISE_TEMPLATES,
        this.COLLECTIONS.USER_SETTINGS,
      ];

      for (const collectionName of collections) {
        const collectionRef = collection(db, collectionName);
        const querySnapshot = await getDocs(collectionRef);
        
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw new Error('データの削除に失敗しました');
    }
  }

  // ========== オフライン対応 ==========

  static async enableOfflineSupport(): Promise<void> {
    try {
      // Firestoreのオフライン永続化を有効化
      // 注意: この機能は一度だけ呼び出す必要があります
      const { enableNetwork } = await import('firebase/firestore');
      await enableNetwork(db);
    } catch (error) {
      console.log('オフライン永続化は既に有効化されています');
    }
  }
}

export default FirestoreService;
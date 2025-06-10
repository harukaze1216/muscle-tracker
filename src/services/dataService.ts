// データサービスの抽象化レイヤー
// FirestoreとローカルストレージのHybridサポート

import { WorkoutSession, ExerciseTemplate, UserSettings } from '../types/workout';
import FirestoreService from './firestoreService';
import StorageService from './storageService';

// データソースの選択
type DataSource = 'firestore' | 'localStorage' | 'hybrid';

interface DataServiceConfig {
  dataSource: DataSource;
  fallbackToLocal: boolean; // Firestoreエラー時にローカルストレージにフォールバック
  syncToFirestore: boolean; // ローカルストレージの変更をFirestoreに同期
}

export class DataService {
  private static config: DataServiceConfig = {
    dataSource: 'hybrid', // デフォルトはハイブリッドモード
    fallbackToLocal: true,
    syncToFirestore: true,
  };

  // 設定の変更
  static configure(newConfig: Partial<DataServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 現在の設定を取得
  static getConfig(): DataServiceConfig {
    return { ...this.config };
  }

  // Firestoreが利用可能かチェック
  private static async isFirestoreAvailable(): Promise<boolean> {
    try {
      // 簡単な接続テスト
      await FirestoreService.getUserSettings();
      return true;
    } catch (error) {
      console.warn('Firestore接続不可:', error);
      return false;
    }
  }

  // ========== ワークアウトセッション関連 ==========

  static async getWorkoutSessions(): Promise<WorkoutSession[]> {
    try {
      switch (this.config.dataSource) {
        case 'firestore':
          return await FirestoreService.getWorkoutSessions();
        
        case 'localStorage':
          return StorageService.getWorkoutSessions();
        
        case 'hybrid':
        default:
          // オンライン時はFirestore、オフライン時はローカルストレージ
          if (navigator.onLine && await this.isFirestoreAvailable()) {
            try {
              const firestoreSessions = await FirestoreService.getWorkoutSessions();
              // Firestoreから取得できたらローカルにも保存（キャッシュ）
              this.syncToLocal('sessions', firestoreSessions);
              return firestoreSessions;
            } catch (error) {
              console.warn('Firestoreからの取得に失敗、ローカルストレージにフォールバック:', error);
              return StorageService.getWorkoutSessions();
            }
          } else {
            return StorageService.getWorkoutSessions();
          }
      }
    } catch (error) {
      console.error('セッション取得エラー:', error);
      // フォールバック
      if (this.config.fallbackToLocal) {
        return StorageService.getWorkoutSessions();
      }
      throw error;
    }
  }

  static async saveWorkoutSession(session: WorkoutSession): Promise<void> {
    try {
      switch (this.config.dataSource) {
        case 'firestore':
          await FirestoreService.saveWorkoutSession(session);
          break;
        
        case 'localStorage':
          StorageService.saveWorkoutSession(session);
          break;
        
        case 'hybrid':
        default:
          // ローカルストレージに即座に保存
          StorageService.saveWorkoutSession(session);
          
          // オンライン時はFirestoreにも保存を試行
          if (navigator.onLine && this.config.syncToFirestore) {
            try {
              await FirestoreService.saveWorkoutSession(session);
            } catch (error) {
              console.warn('Firestoreへの同期に失敗:', error);
              // ローカルには保存済みなので、バックグラウンドで再試行可能
              this.queueForSync('saveSession', session);
            }
          }
          break;
      }
    } catch (error) {
      console.error('セッション保存エラー:', error);
      
      // フォールバック
      if (this.config.fallbackToLocal) {
        StorageService.saveWorkoutSession(session);
      } else {
        throw error;
      }
    }
  }

  // 単一のワークアウトセッションを取得
  static async getWorkoutSession(sessionId: string): Promise<WorkoutSession | null> {
    try {
      switch (this.config.dataSource) {
        case 'firestore':
          return await FirestoreService.getWorkoutSession(sessionId);
        
        case 'localStorage':
          return StorageService.getWorkoutSession(sessionId);
        
        case 'hybrid':
        default:
          if (navigator.onLine && await this.isFirestoreAvailable()) {
            try {
              return await FirestoreService.getWorkoutSession(sessionId);
            } catch (error) {
              console.warn('Firestoreクエリに失敗、ローカルストレージにフォールバック:', error);
              return StorageService.getWorkoutSession(sessionId);
            }
          } else {
            return StorageService.getWorkoutSession(sessionId);
          }
      }
    } catch (error) {
      console.error('セッション取得エラー:', error);
      
      if (this.config.fallbackToLocal) {
        return StorageService.getWorkoutSession(sessionId);
      }
      throw error;
    }
  }

  // 全てのワークアウトセッションを取得
  static async getAllWorkoutSessions(): Promise<WorkoutSession[]> {
    try {
      switch (this.config.dataSource) {
        case 'firestore':
          return await FirestoreService.getAllWorkoutSessions();
        
        case 'localStorage':
          return StorageService.getAllWorkoutSessions();
        
        case 'hybrid':
        default:
          if (navigator.onLine && await this.isFirestoreAvailable()) {
            try {
              return await FirestoreService.getAllWorkoutSessions();
            } catch (error) {
              console.warn('Firestoreクエリに失敗、ローカルストレージにフォールバック:', error);
              return StorageService.getAllWorkoutSessions();
            }
          } else {
            return StorageService.getAllWorkoutSessions();
          }
      }
    } catch (error) {
      console.error('全セッション取得エラー:', error);
      
      if (this.config.fallbackToLocal) {
        return StorageService.getAllWorkoutSessions();
      }
      throw error;
    }
  }

  // セッションを更新
  static async updateWorkoutSession(session: WorkoutSession): Promise<void> {
    try {
      switch (this.config.dataSource) {
        case 'firestore':
          await FirestoreService.updateWorkoutSession(session);
          break;
        
        case 'localStorage':
          StorageService.updateWorkoutSession(session);
          break;
        
        case 'hybrid':
        default:
          // ローカルストレージに即座に保存
          StorageService.updateWorkoutSession(session);
          
          // オンライン時はFirestoreにも保存を試行
          if (navigator.onLine && this.config.syncToFirestore) {
            try {
              await FirestoreService.updateWorkoutSession(session);
            } catch (error) {
              console.warn('Firestoreへの同期に失敗:', error);
              this.queueForSync('updateSession', session);
            }
          }
          break;
      }
    } catch (error) {
      console.error('セッション更新エラー:', error);
      
      if (this.config.fallbackToLocal) {
        StorageService.updateWorkoutSession(session);
      } else {
        throw error;
      }
    }
  }

  static async deleteWorkoutSession(sessionId: string): Promise<void> {
    try {
      switch (this.config.dataSource) {
        case 'firestore':
          await FirestoreService.deleteWorkoutSession(sessionId);
          break;
        
        case 'localStorage':
          StorageService.deleteWorkoutSession(sessionId);
          break;
        
        case 'hybrid':
        default:
          // ローカルストレージから即座に削除
          StorageService.deleteWorkoutSession(sessionId);
          
          // オンライン時はFirestoreからも削除を試行
          if (navigator.onLine && this.config.syncToFirestore) {
            try {
              await FirestoreService.deleteWorkoutSession(sessionId);
            } catch (error) {
              console.warn('Firestoreでの削除に失敗:', error);
              this.queueForSync('deleteSession', sessionId);
            }
          }
          break;
      }
    } catch (error) {
      console.error('セッション削除エラー:', error);
      
      if (this.config.fallbackToLocal) {
        StorageService.deleteWorkoutSession(sessionId);
      } else {
        throw error;
      }
    }
  }

  static async getWorkoutSessionsByDateRange(startDate: string, endDate: string): Promise<WorkoutSession[]> {
    try {
      switch (this.config.dataSource) {
        case 'firestore':
          return await FirestoreService.getWorkoutSessionsByDateRange(startDate, endDate);
        
        case 'localStorage':
          return StorageService.getWorkoutSessionsByDateRange(startDate, endDate);
        
        case 'hybrid':
        default:
          if (navigator.onLine && await this.isFirestoreAvailable()) {
            try {
              return await FirestoreService.getWorkoutSessionsByDateRange(startDate, endDate);
            } catch (error) {
              console.warn('Firestoreクエリに失敗、ローカルストレージにフォールバック:', error);
              return StorageService.getWorkoutSessionsByDateRange(startDate, endDate);
            }
          } else {
            return StorageService.getWorkoutSessionsByDateRange(startDate, endDate);
          }
      }
    } catch (error) {
      console.error('期間指定セッション取得エラー:', error);
      
      if (this.config.fallbackToLocal) {
        return StorageService.getWorkoutSessionsByDateRange(startDate, endDate);
      }
      throw error;
    }
  }

  static async getWorkoutSessionsByExercise(exerciseName: string): Promise<WorkoutSession[]> {
    try {
      switch (this.config.dataSource) {
        case 'firestore':
          return await FirestoreService.getWorkoutSessionsByExercise(exerciseName);
        
        case 'localStorage':
          return StorageService.getWorkoutSessionsByExercise(exerciseName);
        
        case 'hybrid':
        default:
          if (navigator.onLine && await this.isFirestoreAvailable()) {
            try {
              return await FirestoreService.getWorkoutSessionsByExercise(exerciseName);
            } catch (error) {
              console.warn('Firestore種目別クエリに失敗、ローカルストレージにフォールバック:', error);
              return StorageService.getWorkoutSessionsByExercise(exerciseName);
            }
          } else {
            return StorageService.getWorkoutSessionsByExercise(exerciseName);
          }
      }
    } catch (error) {
      console.error('種目別セッション取得エラー:', error);
      
      if (this.config.fallbackToLocal) {
        return StorageService.getWorkoutSessionsByExercise(exerciseName);
      }
      throw error;
    }
  }

  // ========== 種目テンプレート関連 ==========

  static async getExerciseTemplates(): Promise<ExerciseTemplate[]> {
    try {
      switch (this.config.dataSource) {
        case 'firestore':
          return await FirestoreService.getExerciseTemplates();
        
        case 'localStorage':
          return StorageService.getExerciseTemplates();
        
        case 'hybrid':
        default:
          if (navigator.onLine && await this.isFirestoreAvailable()) {
            try {
              const firestoreTemplates = await FirestoreService.getExerciseTemplates();
              this.syncToLocal('templates', firestoreTemplates);
              return firestoreTemplates;
            } catch (error) {
              console.warn('Firestoreテンプレート取得に失敗、ローカルストレージにフォールバック:', error);
              return StorageService.getExerciseTemplates();
            }
          } else {
            return StorageService.getExerciseTemplates();
          }
      }
    } catch (error) {
      console.error('テンプレート取得エラー:', error);
      
      if (this.config.fallbackToLocal) {
        return StorageService.getExerciseTemplates();
      }
      throw error;
    }
  }

  static async saveExerciseTemplate(template: ExerciseTemplate): Promise<void> {
    try {
      switch (this.config.dataSource) {
        case 'firestore':
          await FirestoreService.saveExerciseTemplate(template);
          break;
        
        case 'localStorage':
          StorageService.saveExerciseTemplate(template);
          break;
        
        case 'hybrid':
        default:
          StorageService.saveExerciseTemplate(template);
          
          if (navigator.onLine && this.config.syncToFirestore) {
            try {
              await FirestoreService.saveExerciseTemplate(template);
            } catch (error) {
              console.warn('Firestoreテンプレート同期に失敗:', error);
              this.queueForSync('saveTemplate', template);
            }
          }
          break;
      }
    } catch (error) {
      console.error('テンプレート保存エラー:', error);
      
      if (this.config.fallbackToLocal) {
        StorageService.saveExerciseTemplate(template);
      } else {
        throw error;
      }
    }
  }

  // ========== ユーザー設定関連 ==========

  static async getUserSettings(): Promise<UserSettings> {
    try {
      switch (this.config.dataSource) {
        case 'firestore':
          return await FirestoreService.getUserSettings();
        
        case 'localStorage':
          return StorageService.getUserSettings();
        
        case 'hybrid':
        default:
          if (navigator.onLine && await this.isFirestoreAvailable()) {
            try {
              const firestoreSettings = await FirestoreService.getUserSettings();
              this.syncToLocal('settings', firestoreSettings);
              return firestoreSettings;
            } catch (error) {
              console.warn('Firestore設定取得に失敗、ローカルストレージにフォールバック:', error);
              return StorageService.getUserSettings();
            }
          } else {
            return StorageService.getUserSettings();
          }
      }
    } catch (error) {
      console.error('設定取得エラー:', error);
      
      if (this.config.fallbackToLocal) {
        return StorageService.getUserSettings();
      }
      throw error;
    }
  }

  static async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      switch (this.config.dataSource) {
        case 'firestore':
          await FirestoreService.saveUserSettings(settings);
          break;
        
        case 'localStorage':
          StorageService.saveUserSettings(settings);
          break;
        
        case 'hybrid':
        default:
          StorageService.saveUserSettings(settings);
          
          if (navigator.onLine && this.config.syncToFirestore) {
            try {
              await FirestoreService.saveUserSettings(settings);
            } catch (error) {
              console.warn('Firestore設定同期に失敗:', error);
              this.queueForSync('saveSettings', settings);
            }
          }
          break;
      }
    } catch (error) {
      console.error('設定保存エラー:', error);
      
      if (this.config.fallbackToLocal) {
        StorageService.saveUserSettings(settings);
      } else {
        throw error;
      }
    }
  }

  // ========== データの一括操作 ==========

  static async exportData(): Promise<string> {
    try {
      switch (this.config.dataSource) {
        case 'firestore':
          return await FirestoreService.exportData();
        
        case 'localStorage':
          return StorageService.exportData();
        
        case 'hybrid':
        default:
          if (navigator.onLine && await this.isFirestoreAvailable()) {
            try {
              return await FirestoreService.exportData();
            } catch (error) {
              console.warn('Firestoreエクスポートに失敗、ローカルストレージからエクスポート:', error);
              return StorageService.exportData();
            }
          } else {
            return StorageService.exportData();
          }
      }
    } catch (error) {
      console.error('データエクスポートエラー:', error);
      
      if (this.config.fallbackToLocal) {
        return StorageService.exportData();
      }
      throw error;
    }
  }

  static async importData(jsonData: string): Promise<void> {
    try {
      switch (this.config.dataSource) {
        case 'firestore':
          await FirestoreService.importData(jsonData);
          break;
        
        case 'localStorage':
          StorageService.importData(jsonData);
          break;
        
        case 'hybrid':
        default:
          // ローカルストレージに即座にインポート
          StorageService.importData(jsonData);
          
          if (navigator.onLine && this.config.syncToFirestore) {
            try {
              await FirestoreService.importData(jsonData);
            } catch (error) {
              console.warn('Firestoreインポート同期に失敗:', error);
              // ローカルには保存済み
            }
          }
          break;
      }
    } catch (error) {
      console.error('データインポートエラー:', error);
      
      if (this.config.fallbackToLocal) {
        StorageService.importData(jsonData);
      } else {
        throw error;
      }
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      switch (this.config.dataSource) {
        case 'firestore':
          await FirestoreService.clearAllData();
          break;
        
        case 'localStorage':
          StorageService.clearAllData();
          break;
        
        case 'hybrid':
        default:
          StorageService.clearAllData();
          
          if (navigator.onLine && this.config.syncToFirestore) {
            try {
              await FirestoreService.clearAllData();
            } catch (error) {
              console.warn('Firestoreクリア同期に失敗:', error);
            }
          }
          break;
      }
    } catch (error) {
      console.error('データクリアエラー:', error);
      
      if (this.config.fallbackToLocal) {
        StorageService.clearAllData();
      } else {
        throw error;
      }
    }
  }

  // ========== 同期機能 ==========

  // ローカルストレージにキャッシュとして保存
  private static syncToLocal(type: 'sessions' | 'templates' | 'settings', data: any): void {
    try {
      switch (type) {
        case 'sessions':
          // StorageServiceの内部メソッドを使用
          localStorage.setItem('muscle_tracker_workout_sessions', JSON.stringify(data));
          break;
        case 'templates':
          localStorage.setItem('muscle_tracker_exercise_templates', JSON.stringify(data));
          break;
        case 'settings':
          localStorage.setItem('muscle_tracker_user_settings', JSON.stringify(data));
          break;
      }
    } catch (error) {
      console.warn('ローカル同期エラー:', error);
    }
  }

  // Firestore同期キューの管理（簡易版）
  private static syncQueue: Array<{ action: string; data: any }> = [];

  private static queueForSync(action: string, data: any): void {
    this.syncQueue.push({ action, data });
    
    // バックグラウンドで同期を試行
    setTimeout(() => this.processSyncQueue(), 5000);
  }

  private static async processSyncQueue(): Promise<void> {
    if (!navigator.onLine || this.syncQueue.length === 0) return;

    const queue = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of queue) {
      try {
        switch (item.action) {
          case 'saveSession':
            await FirestoreService.saveWorkoutSession(item.data);
            break;
          case 'deleteSession':
            await FirestoreService.deleteWorkoutSession(item.data);
            break;
          case 'saveTemplate':
            await FirestoreService.saveExerciseTemplate(item.data);
            break;
          case 'saveSettings':
            await FirestoreService.saveUserSettings(item.data);
            break;
        }
      } catch (error) {
        console.warn('同期キュー処理失敗:', error);
        // 再キューイング
        this.syncQueue.push(item);
      }
    }
  }

  // オンライン状態変更の監視
  static initializeOnlineSync(): void {
    window.addEventListener('online', () => {
      console.log('オンラインになりました。同期を開始します。');
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      console.log('オフラインになりました。ローカルストレージモードに切り替えます。');
    });
  }
}

export default DataService;
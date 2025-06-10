import React, { useState, useEffect } from 'react';
import { WorkoutSession } from '../types/workout';
import { useDataService } from '../hooks/useDataService';
import ExerciseProgressChart from '../components/analytics/ExerciseProgressChart';
import './AnalyticsPage.css';

const AnalyticsPage: React.FC = () => {
  const { getAllSessions } = useDataService();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [availableExercises, setAvailableExercises] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<number>(90);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const allSessions = await getAllSessions();
        setSessions(allSessions);

        // 利用可能な種目を抽出
        const exercises = new Set<string>();
        allSessions.forEach(session => {
          session.exercises.forEach(exercise => {
            exercises.add(exercise.name);
          });
        });
        
        const exerciseList = Array.from(exercises).sort();
        setAvailableExercises(exerciseList);
        
        // デフォルトで最初の種目を選択
        if (exerciseList.length > 0 && !selectedExercise) {
          setSelectedExercise(exerciseList[0]);
        }
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getAllSessions, selectedExercise]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="page-header">
          <h2>📊 詳細分析</h2>
          <p>データを読み込み中...</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (availableExercises.length === 0) {
    return (
      <div className="analytics-page">
        <div className="page-header">
          <h2>📊 詳細分析</h2>
          <p>パフォーマンスの推移を確認</p>
        </div>
        <div className="no-data-message">
          <div className="no-data-icon">📈</div>
          <h3>分析データなし</h3>
          <p>トレーニングを記録して分析を開始しましょう</p>
          <p className="hint">少なくとも1回のワークアウト記録が必要です</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h2>📊 詳細分析</h2>
        <p>パフォーマンスの推移を確認</p>
      </div>

      <div className="analytics-controls">
        <div className="control-group">
          <label htmlFor="exercise-select">種目選択</label>
          <select
            id="exercise-select"
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="exercise-select"
          >
            {availableExercises.map(exercise => (
              <option key={exercise} value={exercise}>
                {exercise}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="time-range-select">表示期間</label>
          <select
            id="time-range-select"
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="time-range-select"
          >
            <option value={30}>30日間</option>
            <option value={90}>90日間</option>
            <option value={180}>180日間</option>
            <option value={365}>1年間</option>
          </select>
        </div>
      </div>

      {selectedExercise && (
        <ExerciseProgressChart
          sessions={sessions}
          exerciseName={selectedExercise}
          showMaxWeight={true}
          showAvgWeight={true}
          showVolume={false}
          timeRange={timeRange}
        />
      )}

      <div className="analytics-summary">
        <h3>📋 分析サマリー</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">💪</div>
            <div className="summary-content">
              <h4>記録種目数</h4>
              <span className="summary-value">{availableExercises.length}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">📅</div>
            <div className="summary-content">
              <h4>総セッション数</h4>
              <span className="summary-value">{sessions.length}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🏆</div>
            <div className="summary-content">
              <h4>分析対象期間</h4>
              <span className="summary-value">{timeRange}日</span>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-tips">
        <h4>💡 分析のヒント</h4>
        <ul>
          <li>継続的な記録により、より正確な分析が可能になります</li>
          <li>複数の期間を比較して長期的な成長を確認しましょう</li>
          <li>重量の増加だけでなく、レップ数やセット数の変化にも注目してください</li>
          <li>目標ラインを参考に次回の目標を設定しましょう</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsPage;
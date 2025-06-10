import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnalyticsService } from '../services/analyticsService';
import { DataService } from '../services/dataService';
import { ExerciseSuggestion, WorkoutSession } from '../types/workout';
import { formatDate, getTodayString } from '../utils/helpers';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<ExerciseSuggestion[]>([]);
  const [todayWorkout, setTodayWorkout] = useState<WorkoutSession | null>(null);
  const [weeklyStats, setWeeklyStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    mostTrainedCategory: 'なし',
    streak: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // まずAnalyticsServiceのキャッシュを更新
      await AnalyticsService.updateCache();

      const today = getTodayString();
      const todaySessions = await DataService.getWorkoutSessionsByDateRange(today, today);
      
      if (todaySessions.length > 0) {
        setTodayWorkout(todaySessions[0]);
      }

      const exerciseSuggestions = AnalyticsService.suggestTodaysExercises();
      setSuggestions(exerciseSuggestions.slice(0, 3)); // 上位3つを表示

      const stats = AnalyticsService.getWeeklyStats();
      setWeeklyStats(stats);
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    }
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const colors = {
      high: '#dc2626',
      medium: '#f59e0b',
      low: '#10b981',
    };
    return (
      <span 
        className="priority-badge" 
        style={{ backgroundColor: colors[priority] }}
      >
        {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
      </span>
    );
  };

  return (
    <div className="home-page">
      <section className="welcome-section">
        <h2>今日も頑張りましょう！</h2>
        <p className="today-date">{formatDate(new Date())}</p>
      </section>

      {todayWorkout && (
        <section className="today-workout">
          <h3>✅ 今日のワークアウト</h3>
          <div className="workout-summary">
            <p>{todayWorkout.exercises.length}種目を実施済み</p>
            <Link to="/history" className="view-details-link">
              詳細を見る →
            </Link>
          </div>
        </section>
      )}

      <section className="suggestions-section">
        <h3>🎯 今日のおすすめ</h3>
        {suggestions.length > 0 ? (
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div key={suggestion.exercise.id} className="suggestion-card">
                <div className="suggestion-header">
                  <span className="exercise-name">{suggestion.exercise.name}</span>
                  {getPriorityBadge(suggestion.priority)}
                </div>
                <p className="suggestion-reason">{suggestion.reason}</p>
                <div className="suggestion-details">
                  <span className="category">{suggestion.exercise.category}</span>
                  {suggestion.suggestedWeight && (
                    <span className="suggested-weight">
                      推奨: {suggestion.suggestedWeight}kg × {suggestion.suggestedReps}回
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-suggestions">
            <p>今日は休養日がおすすめです</p>
            <p className="rest-message">体をしっかり回復させましょう 💤</p>
          </div>
        )}
        <Link to="/workout" className="start-workout-btn">
          ワークアウト開始 →
        </Link>
      </section>

      <section className="stats-section">
        <h3>📊 今週の統計</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{weeklyStats.totalWorkouts}</div>
            <div className="stat-label">ワークアウト</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round(weeklyStats.totalVolume)}</div>
            <div className="stat-label">総挙上量(kg)</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{weeklyStats.streak}</div>
            <div className="stat-label">連続日数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{weeklyStats.mostTrainedCategory}</div>
            <div className="stat-label">メイン部位</div>
          </div>
        </div>
        <Link to="/analytics" className="view-analytics-link">
          詳細分析を見る →
        </Link>
      </section>

      <section className="quick-actions">
        <h3>🚀 クイックアクション</h3>
        <div className="action-buttons">
          <Link to="/workout" className="action-btn primary">
            <span className="action-icon">💪</span>
            新規ワークアウト
          </Link>
          <Link to="/history" className="action-btn secondary">
            <span className="action-icon">📅</span>
            履歴を確認
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
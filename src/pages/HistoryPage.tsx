import React, { useState, useEffect } from 'react';
import { WorkoutSession } from '../types/workout';
import DataService from '../services/dataService';
import Calendar from '../components/history/Calendar';
import WorkoutSessionCard from '../components/history/WorkoutSessionCard';
import { getTodayString, formatDate, sortByDate } from '../utils/helpers';
import './HistoryPage.css';

type ViewMode = 'calendar' | 'list';

const HistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const allSessions = await DataService.getWorkoutSessions();
      setSessions(sortByDate(allSessions, true));
    } catch (error) {
      console.error('セッションの読み込みに失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleToggleExpand = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await DataService.deleteWorkoutSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      setExpandedSessions(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    } catch (error) {
      alert('削除に失敗しました。もう一度お試しください。');
    }
  };

  const getSelectedDateSessions = () => {
    return sessions.filter(session => session.date === selectedDate);
  };

  const getVisibleSessions = () => {
    if (viewMode === 'calendar') {
      return getSelectedDateSessions();
    }
    
    // リスト表示では現在の月のセッションを表示
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= monthStart && sessionDate <= monthEnd;
    });
  };

  const getMonthlyStats = () => {
    const visibleSessions = getVisibleSessions();
    
    const totalWorkouts = visibleSessions.length;
    const totalExercises = visibleSessions.reduce((total, session) => 
      total + session.exercises.length, 0);
    const totalSets = visibleSessions.reduce((total, session) => 
      total + session.exercises.reduce((exerciseTotal, exercise) => 
        exerciseTotal + exercise.sets.length, 0), 0);
    const totalVolume = visibleSessions.reduce((total, session) => 
      total + session.exercises.reduce((exerciseTotal, exercise) => 
        exerciseTotal + exercise.sets.reduce((setTotal, set) => 
          setTotal + (set.weight * set.reps), 0), 0), 0);

    return {
      totalWorkouts,
      totalExercises,
      totalSets,
      totalVolume: Math.round(totalVolume),
    };
  };

  const stats = getMonthlyStats();

  if (isLoading) {
    return (
      <div className="history-page">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>履歴を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <div className="header-title">
          <h2>📅 ワークアウト履歴</h2>
          <p>過去のトレーニング記録を確認</p>
        </div>

        <div className="view-controls">
          <button
            onClick={() => setViewMode('calendar')}
            className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
          >
            📅 カレンダー
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
          >
            📋 リスト
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="empty-history">
          <div className="empty-icon">📝</div>
          <h3>まだワークアウト記録がありません</h3>
          <p>トレーニングを記録して進捗を確認しましょう</p>
        </div>
      ) : (
        <>
          <div className="monthly-stats">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">{stats.totalWorkouts}</span>
                <span className="stat-label">ワークアウト</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.totalExercises}</span>
                <span className="stat-label">種目</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.totalSets}</span>
                <span className="stat-label">セット</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.totalVolume}</span>
                <span className="stat-label">総量(kg)</span>
              </div>
            </div>
          </div>

          {viewMode === 'calendar' && (
            <>
              <Calendar
                sessions={sessions}
                currentMonth={currentMonth}
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
                onMonthChange={handleMonthChange}
              />

              <div className="selected-date-sessions">
                <h3 className="selected-date-title">
                  {formatDate(selectedDate)}のワークアウト
                </h3>
                
                {getSelectedDateSessions().length === 0 ? (
                  <div className="no-sessions">
                    <p>この日はワークアウトを行っていません</p>
                  </div>
                ) : (
                  <div className="sessions-list">
                    {getSelectedDateSessions().map(session => (
                      <WorkoutSessionCard
                        key={session.id}
                        session={session}
                        isExpanded={expandedSessions.has(session.id)}
                        onToggleExpand={handleToggleExpand}
                        onDelete={handleDeleteSession}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {viewMode === 'list' && (
            <>
              <div className="list-header">
                <div className="month-navigation">
                  <button 
                    onClick={() => handleMonthChange('prev')}
                    className="month-nav-btn"
                  >
                    ‹ 前月
                  </button>
                  <h3 className="current-month">
                    {currentMonth.toLocaleDateString('ja-JP', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </h3>
                  <button 
                    onClick={() => handleMonthChange('next')}
                    className="month-nav-btn"
                  >
                    次月 ›
                  </button>
                </div>
              </div>

              <div className="sessions-list">
                {getVisibleSessions().length === 0 ? (
                  <div className="no-sessions">
                    <p>この月はワークアウトを行っていません</p>
                  </div>
                ) : (
                  getVisibleSessions().map(session => (
                    <WorkoutSessionCard
                      key={session.id}
                      session={session}
                      isExpanded={expandedSessions.has(session.id)}
                      onToggleExpand={handleToggleExpand}
                      onDelete={handleDeleteSession}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryPage;
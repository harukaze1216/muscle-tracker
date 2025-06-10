import React, { useMemo } from 'react';
import { WorkoutSession } from '../../types/workout';
import { formatDateShort, getTodayString } from '../../utils/helpers';
import './Calendar.css';

interface CalendarProps {
  sessions: WorkoutSession[];
  currentMonth: Date;
  onDateSelect: (date: string) => void;
  selectedDate?: string;
  onMonthChange: (direction: 'prev' | 'next') => void;
}

const Calendar: React.FC<CalendarProps> = ({
  sessions,
  currentMonth,
  onDateSelect,
  selectedDate,
  onMonthChange,
}) => {
  const today = getTodayString();

  const { monthDays, sessionsByDate } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // 月の最初の日と最後の日を取得
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // カレンダーの開始日（月の最初の週の日曜日）
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // カレンダーの終了日（月の最後の週の土曜日）
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    // 日付の配列を生成
    const days: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    // セッションを日付でグループ化
    const sessionMap: Record<string, WorkoutSession[]> = {};
    sessions.forEach(session => {
      const sessionDate = session.date;
      if (!sessionMap[sessionDate]) {
        sessionMap[sessionDate] = [];
      }
      sessionMap[sessionDate].push(session);
    });
    
    return {
      monthDays: days,
      sessionsByDate: sessionMap,
    };
  }, [currentMonth, sessions]);

  const getMonthYear = () => {
    return currentMonth.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getDayClasses = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const isToday = dateStr === today;
    const isSelected = dateStr === selectedDate;
    const hasWorkout = sessionsByDate[dateStr]?.length > 0;
    
    const classes = ['calendar-day'];
    
    if (!isCurrentMonth) classes.push('other-month');
    if (isToday) classes.push('today');
    if (isSelected) classes.push('selected');
    if (hasWorkout) classes.push('has-workout');
    
    return classes.join(' ');
  };

  const getWorkoutIndicator = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const daySessions = sessionsByDate[dateStr];
    
    if (!daySessions || daySessions.length === 0) return null;
    
    const totalExercises = daySessions.reduce((total, session) => 
      total + session.exercises.length, 0
    );
    
    return (
      <div className="workout-indicator">
        <span className="workout-count">{totalExercises}</span>
      </div>
    );
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button 
          onClick={() => onMonthChange('prev')}
          className="month-nav-btn"
          aria-label="前の月"
        >
          ‹
        </button>
        <h3 className="month-title">{getMonthYear()}</h3>
        <button 
          onClick={() => onMonthChange('next')}
          className="month-nav-btn"
          aria-label="次の月"
        >
          ›
        </button>
      </div>

      <div className="calendar-grid">
        <div className="week-header">
          {weekDays.map(day => (
            <div key={day} className="week-day-label">
              {day}
            </div>
          ))}
        </div>

        <div className="month-days">
          {monthDays.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            return (
              <button
                key={index}
                onClick={() => onDateSelect(dateStr)}
                className={getDayClasses(date)}
                aria-label={`${date.getDate()}日${sessionsByDate[dateStr]?.length ? ' (ワークアウトあり)' : ''}`}
              >
                <span className="day-number">{date.getDate()}</span>
                {getWorkoutIndicator(date)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-dot today-dot"></div>
          <span>今日</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot workout-dot"></div>
          <span>ワークアウト実施</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
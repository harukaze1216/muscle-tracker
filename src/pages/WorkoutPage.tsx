import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../hooks/useWorkout';
import { ExerciseTemplate } from '../types/workout';
import ExerciseSelector from '../components/workout/ExerciseSelector';
import SetInput from '../components/workout/SetInput';
import { formatDate, getTodayString, calculateVolume } from '../utils/helpers';
import './WorkoutPage.css';

const WorkoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentSession,
    isWorkoutActive,
    startWorkout,
    endWorkout,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    updateNotes,
    saveWorkout,
  } = useWorkout();
  
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleStartWorkout = () => {
    startWorkout();
  };

  const handleSelectExercise = (template: ExerciseTemplate) => {
    addExercise(template);
    setShowExerciseSelector(false);
  };

  const handleSaveWorkout = async () => {
    if (!currentSession || currentSession.exercises.length === 0) {
      alert('種目を追加してください');
      return;
    }

    const hasAnySets = currentSession.exercises.some(ex => ex.sets.length > 0);
    if (!hasAnySets) {
      alert('最低1セット記録してください');
      return;
    }

    setIsSaving(true);
    try {
      await saveWorkout();
      alert('ワークアウトを保存しました！お疲れ様でした 🎉');
      navigate('/');
    } catch (error) {
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardWorkout = () => {
    if (window.confirm('ワークアウトを破棄しますか？記録は保存されません。')) {
      endWorkout();
    }
  };

  const calculateSessionStats = (): { totalVolume: number; totalSets: number; exerciseCount: number } => {
    if (!currentSession) return { totalVolume: 0, totalSets: 0, exerciseCount: 0 };
    
    const totalVolume = currentSession.exercises.reduce((total, exercise) => 
      total + exercise.sets.reduce((setTotal, set) => 
        setTotal + calculateVolume(set.weight, set.reps), 0
      ), 0
    );
    
    const totalSets = currentSession.exercises.reduce((total, exercise) => 
      total + exercise.sets.length, 0
    );
    
    const exerciseCount = currentSession.exercises.length;
    
    return { totalVolume, totalSets, exerciseCount };
  };

  if (!isWorkoutActive) {
    return (
      <div className="workout-page">
        <div className="page-header">
          <h2>💪 ワークアウト記録</h2>
          <p>{formatDate(getTodayString())}</p>
        </div>

        <div className="start-workout-section">
          <div className="start-workout-card">
            <div className="start-icon">🏋️‍♂️</div>
            <h3>今日のワークアウトを始めましょう！</h3>
            <p>種目を選択してセットを記録できます</p>
            <button onClick={handleStartWorkout} className="start-workout-button">
              ワークアウト開始
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateSessionStats();

  return (
    <div className="workout-page">
      <div className="workout-header">
        <div className="workout-title">
          <h2>💪 ワークアウト中</h2>
          <p>{formatDate(currentSession?.date || getTodayString())}</p>
        </div>
        
        {stats.exerciseCount > 0 && (
          <div className="workout-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.exerciseCount}</span>
              <span className="stat-label">種目</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.totalSets}</span>
              <span className="stat-label">セット</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{Math.round(stats.totalVolume)}</span>
              <span className="stat-label">総量(kg)</span>
            </div>
          </div>
        )}
      </div>

      <div className="workout-content">
        {currentSession?.exercises.length === 0 ? (
          <div className="empty-workout">
            <div className="empty-icon">📝</div>
            <h3>種目を追加してください</h3>
            <p>下のボタンから種目を選択してトレーニングを記録しましょう</p>
          </div>
        ) : (
          <div className="exercises-list">
            {currentSession?.exercises.map((exercise) => (
              <div key={exercise.id} className="exercise-container">
                <div className="exercise-header">
                  <h4>{exercise.name}</h4>
                  <button
                    onClick={() => removeExercise(exercise.id)}
                    className="remove-exercise-btn"
                    title="種目を削除"
                  >
                    🗑️
                  </button>
                </div>
                
                <SetInput
                  sets={exercise.sets}
                  onAddSet={(weight, reps) => addSet(exercise.id, weight, reps)}
                  onUpdateSet={(setId, weight, reps) => updateSet(exercise.id, setId, weight, reps)}
                  onRemoveSet={(setId) => removeSet(exercise.id, setId)}
                  exerciseName={exercise.name}
                />
              </div>
            ))}
          </div>
        )}

        <div className="workout-notes">
          <label htmlFor="workout-notes">メモ（調子・疲労度など）</label>
          <textarea
            id="workout-notes"
            value={currentSession?.notes || ''}
            onChange={(e) => updateNotes(e.target.value)}
            placeholder="今日の調子や気づいたことを記録..."
            rows={3}
          />
        </div>
      </div>

      <div className="workout-actions">
        <button
          onClick={() => setShowExerciseSelector(true)}
          className="add-exercise-btn"
        >
          ➕ 種目を追加
        </button>
        
        <div className="workout-controls">
          <button
            onClick={handleDiscardWorkout}
            className="discard-btn"
          >
            破棄
          </button>
          <button
            onClick={handleSaveWorkout}
            className="save-workout-btn"
            disabled={isSaving || !currentSession?.exercises.length}
          >
            {isSaving ? '保存中...' : 'ワークアウト完了'}
          </button>
        </div>
      </div>

      {showExerciseSelector && (
        <ExerciseSelector
          onSelectExercise={handleSelectExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}
    </div>
  );
};

export default WorkoutPage;
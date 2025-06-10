import React, { useState } from 'react';
import { WorkoutSession, Exercise } from '../../types/workout';
import { formatDate, formatWeight, calculateVolume, getCategoryColor } from '../../utils/helpers';
import './WorkoutSessionCard.css';

interface WorkoutSessionCardProps {
  session: WorkoutSession;
  onEdit?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: (sessionId: string) => void;
}

const WorkoutSessionCard: React.FC<WorkoutSessionCardProps> = ({
  session,
  onEdit,
  onDelete,
  isExpanded = false,
  onToggleExpand,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(session.id);
    }
    setShowDeleteConfirm(false);
  };

  const calculateSessionStats = () => {
    const totalSets = session.exercises.reduce((total, exercise) => 
      total + exercise.sets.length, 0
    );
    
    const totalVolume = session.exercises.reduce((total, exercise) => 
      total + exercise.sets.reduce((setTotal, set) => 
        setTotal + calculateVolume(set.weight, set.reps), 0
      ), 0
    );
    
    const categories = new Set(session.exercises.map(ex => ex.category));
    
    return {
      exerciseCount: session.exercises.length,
      totalSets,
      totalVolume,
      categories: Array.from(categories),
    };
  };

  const stats = calculateSessionStats();

  const renderExerciseDetails = (exercise: Exercise) => {
    if (exercise.sets.length === 0) return null;

    const exerciseVolume = exercise.sets.reduce((total, set) => 
      total + calculateVolume(set.weight, set.reps), 0
    );

    const maxWeight = Math.max(...exercise.sets.map(set => set.weight));

    return (
      <div key={exercise.id} className="exercise-details">
        <div className="exercise-header">
          <h5 className="exercise-name">{exercise.name}</h5>
          <div className="exercise-stats">
            <span className="exercise-stat">
              {exercise.sets.length}セット
            </span>
            <span className="exercise-stat">
              最大{formatWeight(maxWeight)}
            </span>
            <span className="exercise-stat">
              {Math.round(exerciseVolume)}kg
            </span>
          </div>
        </div>
        
        <div className="sets-summary">
          {exercise.sets.map((set, index) => (
            <div key={set.id} className="set-summary">
              <span className="set-number">{index + 1}</span>
              <span className="set-details">
                {formatWeight(set.weight)} × {set.reps}回
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="workout-session-card">
      <div className="session-header">
        <div className="session-info">
          <h4 className="session-date">{formatDate(session.date)}</h4>
          <div className="session-stats">
            <span className="stat-item">
              {stats.exerciseCount}種目
            </span>
            <span className="stat-item">
              {stats.totalSets}セット
            </span>
            <span className="stat-item">
              {Math.round(stats.totalVolume)}kg
            </span>
          </div>
        </div>
        
        <div className="session-actions">
          {onToggleExpand && (
            <button
              onClick={() => onToggleExpand(session.id)}
              className="toggle-btn"
              aria-label={isExpanded ? '詳細を閉じる' : '詳細を開く'}
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          )}
          
          {(onEdit || onDelete) && (
            <div className="action-buttons">
              {onEdit && (
                <button
                  onClick={() => onEdit(session.id)}
                  className="edit-btn"
                  title="編集"
                >
                  ✏️
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="delete-btn"
                  title="削除"
                >
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="session-categories">
        {stats.categories.map(category => (
          <span
            key={category}
            className="category-tag"
            style={{ backgroundColor: getCategoryColor(category) }}
          >
            {category}
          </span>
        ))}
      </div>

      {session.exercises.length > 0 && (
        <div className="session-summary">
          {session.exercises.slice(0, 3).map(exercise => (
            <div key={exercise.id} className="exercise-summary">
              <span className="exercise-name">{exercise.name}</span>
              <span className="exercise-sets">{exercise.sets.length}セット</span>
            </div>
          ))}
          {session.exercises.length > 3 && (
            <div className="more-exercises">
              +{session.exercises.length - 3}種目
            </div>
          )}
        </div>
      )}

      {isExpanded && (
        <div className="session-details">
          <div className="exercises-list">
            {session.exercises.map(renderExerciseDetails)}
          </div>
          
          {session.notes && (
            <div className="session-notes">
              <h6>メモ</h6>
              <p>{session.notes}</p>
            </div>
          )}
          
          <div className="session-timestamps">
            <span className="timestamp">
              作成: {new Date(session.createdAt).toLocaleString('ja-JP')}
            </span>
            {session.updatedAt !== session.createdAt && (
              <span className="timestamp">
                更新: {new Date(session.updatedAt).toLocaleString('ja-JP')}
              </span>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm">
            <h5>ワークアウトを削除しますか？</h5>
            <p>この操作は取り消せません。</p>
            <div className="confirm-actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="cancel-btn"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="confirm-delete-btn"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutSessionCard;
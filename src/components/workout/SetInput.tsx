import React, { useState } from 'react';
import { WorkoutSet } from '../../types/workout';
import { formatWeight, isValidWeight, isValidReps } from '../../utils/helpers';
import './SetInput.css';

interface SetInputProps {
  sets: WorkoutSet[];
  onAddSet: (weight: number, reps: number) => void;
  onUpdateSet: (setId: string, weight: number, reps: number) => void;
  onRemoveSet: (setId: string) => void;
  exerciseName: string;
}

const SetInput: React.FC<SetInputProps> = ({
  sets,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  exerciseName,
}) => {
  const [newWeight, setNewWeight] = useState<string>('');
  const [newReps, setNewReps] = useState<string>('');
  const [editingSet, setEditingSet] = useState<string | null>(null);

  const handleAddSet = () => {
    const weight = parseFloat(newWeight);
    const reps = parseInt(newReps);

    if (!isValidWeight(weight) || !isValidReps(reps)) {
      alert('正しい重量（0.1-1000kg）と回数（1-100回）を入力してください');
      return;
    }

    onAddSet(weight, reps);
    setNewWeight('');
    setNewReps('');
  };

  const handleUpdateSet = (set: WorkoutSet) => {
    if (!editingSet) return;

    const weight = parseFloat(newWeight);
    const reps = parseInt(newReps);

    if (!isValidWeight(weight) || !isValidReps(reps)) {
      alert('正しい重量（0.1-1000kg）と回数（1-100回）を入力してください');
      return;
    }

    onUpdateSet(set.id, weight, reps);
    setEditingSet(null);
    setNewWeight('');
    setNewReps('');
  };

  const startEdit = (set: WorkoutSet) => {
    setEditingSet(set.id);
    setNewWeight(set.weight.toString());
    setNewReps(set.reps.toString());
  };

  const cancelEdit = () => {
    setEditingSet(null);
    setNewWeight('');
    setNewReps('');
  };

  const getLastSetData = () => {
    if (sets.length === 0) return null;
    const lastSet = sets[sets.length - 1];
    return { weight: lastSet.weight, reps: lastSet.reps };
  };

  const useLastSetData = () => {
    const lastSet = getLastSetData();
    if (lastSet) {
      setNewWeight(lastSet.weight.toString());
      setNewReps(lastSet.reps.toString());
    }
  };

  const calculateTotalVolume = () => {
    return sets.reduce((total, set) => total + (set.weight * set.reps), 0);
  };

  return (
    <div className="set-input">
      <div className="set-header">
        <h4>{exerciseName}</h4>
        {sets.length > 0 && (
          <div className="set-summary">
            <span className="set-count">{sets.length}セット</span>
            <span className="total-volume">総量: {Math.round(calculateTotalVolume())}kg</span>
          </div>
        )}
      </div>

      {sets.length > 0 && (
        <div className="sets-list">
          <div className="sets-header">
            <span className="set-number">セット</span>
            <span className="set-weight">重量(kg)</span>
            <span className="set-reps">回数</span>
            <span className="set-volume">挙上量</span>
            <span className="set-actions">操作</span>
          </div>
          
          {sets.map((set, index) => (
            <div key={set.id} className="set-row">
              <span className="set-number">{index + 1}</span>
              
              {editingSet === set.id ? (
                <>
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="set-input-field weight-input"
                    min="0.1"
                    max="1000"
                    step="0.1"
                  />
                  <input
                    type="number"
                    value={newReps}
                    onChange={(e) => setNewReps(e.target.value)}
                    className="set-input-field reps-input"
                    min="1"
                    max="100"
                  />
                  <span className="set-volume">
                    {Math.round(parseFloat(newWeight || '0') * parseInt(newReps || '0'))}kg
                  </span>
                  <div className="set-actions">
                    <button
                      onClick={() => handleUpdateSet(set)}
                      className="save-btn"
                      disabled={!newWeight || !newReps}
                    >
                      ✓
                    </button>
                    <button onClick={cancelEdit} className="cancel-btn">×</button>
                  </div>
                </>
              ) : (
                <>
                  <span className="set-weight">{formatWeight(set.weight)}</span>
                  <span className="set-reps">{set.reps}回</span>
                  <span className="set-volume">{Math.round(set.weight * set.reps)}kg</span>
                  <div className="set-actions">
                    <button onClick={() => startEdit(set)} className="edit-btn">✏️</button>
                    <button onClick={() => onRemoveSet(set.id)} className="remove-btn">🗑️</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {editingSet === null && (
        <div className="add-set-form">
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="weight">重量 (kg)</label>
              <input
                id="weight"
                type="number"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="重量"
                min="0.1"
                max="1000"
                step="0.1"
                className="weight-input"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="reps">回数</label>
              <input
                id="reps"
                type="number"
                value={newReps}
                onChange={(e) => setNewReps(e.target.value)}
                placeholder="回数"
                min="1"
                max="100"
                className="reps-input"
              />
            </div>
          </div>

          <div className="form-actions">
            {(() => {
              const lastSet = getLastSetData();
              return lastSet && (
                <button
                  onClick={useLastSetData}
                  className="use-last-btn"
                  type="button"
                >
                  前回と同じ ({formatWeight(lastSet.weight)} × {lastSet.reps}回)
                </button>
              );
            })()}
            
            <button
              onClick={handleAddSet}
              className="add-set-btn"
              disabled={!newWeight || !newReps}
            >
              セット追加
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetInput;
import { useState, useCallback } from 'react';
import { WorkoutSession, Exercise, WorkoutSet, ExerciseTemplate } from '../types/workout';
import DataService from '../services/dataService';
import { generateId, getTodayString } from '../utils/helpers';

interface UseWorkoutReturn {
  currentSession: WorkoutSession | null;
  isWorkoutActive: boolean;
  startWorkout: () => void;
  endWorkout: () => void;
  addExercise: (template: ExerciseTemplate) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string, weight: number, reps: number) => void;
  updateSet: (exerciseId: string, setId: string, weight: number, reps: number) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateNotes: (notes: string) => void;
  saveWorkout: () => Promise<void>;
}

export const useWorkout = (): UseWorkoutReturn => {
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);

  const startWorkout = useCallback(() => {
    const newSession: WorkoutSession = {
      id: generateId(),
      date: getTodayString(),
      exercises: [],
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentSession(newSession);
    setIsWorkoutActive(true);
  }, []);

  const endWorkout = useCallback(() => {
    setIsWorkoutActive(false);
  }, []);

  const addExercise = useCallback((template: ExerciseTemplate) => {
    if (!currentSession) return;

    const newExercise: Exercise = {
      id: generateId(),
      name: template.name,
      category: template.category,
      sets: [],
    };

    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: [...prev.exercises, newExercise],
        updatedAt: new Date(),
      };
    });
  }, [currentSession]);

  const removeExercise = useCallback((exerciseId: string) => {
    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.filter(ex => ex.id !== exerciseId),
        updatedAt: new Date(),
      };
    });
  }, []);

  const addSet = useCallback((exerciseId: string, weight: number, reps: number) => {
    const newSet: WorkoutSet = {
      id: generateId(),
      weight,
      reps,
    };

    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(exercise => 
          exercise.id === exerciseId
            ? { ...exercise, sets: [...exercise.sets, newSet] }
            : exercise
        ),
        updatedAt: new Date(),
      };
    });
  }, []);

  const updateSet = useCallback((exerciseId: string, setId: string, weight: number, reps: number) => {
    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(exercise => 
          exercise.id === exerciseId
            ? {
                ...exercise,
                sets: exercise.sets.map(set =>
                  set.id === setId ? { ...set, weight, reps } : set
                )
              }
            : exercise
        ),
        updatedAt: new Date(),
      };
    });
  }, []);

  const removeSet = useCallback((exerciseId: string, setId: string) => {
    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(exercise => 
          exercise.id === exerciseId
            ? { ...exercise, sets: exercise.sets.filter(set => set.id !== setId) }
            : exercise
        ),
        updatedAt: new Date(),
      };
    });
  }, []);

  const updateNotes = useCallback((notes: string) => {
    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        notes,
        updatedAt: new Date(),
      };
    });
  }, []);

  const saveWorkout = useCallback(async (): Promise<void> => {
    if (!currentSession || currentSession.exercises.length === 0) {
      throw new Error('ワークアウトデータがありません');
    }

    try {
      await DataService.saveWorkoutSession(currentSession);
      setCurrentSession(null);
      setIsWorkoutActive(false);
    } catch (error) {
      console.error('ワークアウトの保存に失敗しました:', error);
      throw error;
    }
  }, [currentSession]);

  return {
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
  };
};
// DataServiceフックの実装
import { useCallback } from 'react';
import { WorkoutSession } from '../types/workout';
import DataService from '../services/dataService';

export const useDataService = () => {
  const saveSession = useCallback(async (session: WorkoutSession): Promise<void> => {
    return DataService.saveWorkoutSession(session);
  }, []);

  const getSession = useCallback(async (id: string): Promise<WorkoutSession | null> => {
    return DataService.getWorkoutSession(id);
  }, []);

  const getAllSessions = useCallback(async (): Promise<WorkoutSession[]> => {
    return DataService.getAllWorkoutSessions();
  }, []);

  const getSessionsByDateRange = useCallback(async (
    startDate: string, 
    endDate: string
  ): Promise<WorkoutSession[]> => {
    return DataService.getWorkoutSessionsByDateRange(startDate, endDate);
  }, []);

  const updateSession = useCallback(async (session: WorkoutSession): Promise<void> => {
    return DataService.updateWorkoutSession(session);
  }, []);

  const deleteSession = useCallback(async (id: string): Promise<void> => {
    return DataService.deleteWorkoutSession(id);
  }, []);

  const clearAllData = useCallback(async (): Promise<void> => {
    return DataService.clearAllData();
  }, []);

  const getStorageInfo = useCallback(() => {
    return DataService.getStorageInfo();
  }, []);

  return {
    saveSession,
    getSession,
    getAllSessions,
    getSessionsByDateRange,
    updateSession,
    deleteSession,
    clearAllData,
    getStorageInfo,
  };
};
// DataServiceフックの実装
import { useCallback } from 'react';
import { WorkoutSession } from '../types/workout';
import DataService from '../services/dataService';

// DataServiceのシングルトンインスタンス
const dataService = new DataService();

export const useDataService = () => {
  const saveSession = useCallback(async (session: WorkoutSession): Promise<void> => {
    return dataService.saveSession(session);
  }, []);

  const getSession = useCallback(async (id: string): Promise<WorkoutSession | null> => {
    return dataService.getSession(id);
  }, []);

  const getAllSessions = useCallback(async (): Promise<WorkoutSession[]> => {
    return dataService.getAllSessions();
  }, []);

  const getSessionsByDateRange = useCallback(async (
    startDate: string, 
    endDate: string
  ): Promise<WorkoutSession[]> => {
    return dataService.getSessionsByDateRange(startDate, endDate);
  }, []);

  const updateSession = useCallback(async (session: WorkoutSession): Promise<void> => {
    return dataService.updateSession(session);
  }, []);

  const deleteSession = useCallback(async (id: string): Promise<void> => {
    return dataService.deleteSession(id);
  }, []);

  const clearAllData = useCallback(async (): Promise<void> => {
    return dataService.clearAllData();
  }, []);

  const getStorageInfo = useCallback(() => {
    return dataService.getStorageInfo();
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
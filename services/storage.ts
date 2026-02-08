import { AppData } from '../types';
import { MOCK_DATA } from '../constants';

const STORAGE_KEY = 'context_flow_db_v1';

export const loadData = (): AppData => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return MOCK_DATA;
    return JSON.parse(serialized);
  } catch (e) {
    console.error("Failed to load data", e);
    return MOCK_DATA;
  }
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

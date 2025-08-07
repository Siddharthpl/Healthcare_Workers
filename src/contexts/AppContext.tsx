'use client';

'use client';

import React, { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'MANAGER' | 'CARE_WORKER';
}

interface Organization {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface ClockRecord {
  id: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT';
  timestamp: string;
  latitude?: number;
  longitude?: number;
  note?: string;
  user: User;
}

interface AppState {
  user: User | null;
  organization: Organization | null;
  clockedInUsers: User[];
  userLocation: { latitude: number; longitude: number } | null;
  isWithinPerimeter: boolean;
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ORGANIZATION'; payload: Organization | null }
  | { type: 'SET_CLOCKED_IN_USERS'; payload: User[] }
  | { type: 'SET_USER_LOCATION'; payload: { latitude: number; longitude: number } | null }
  | { type: 'SET_WITHIN_PERIMETER'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

const initialState: AppState = {
  user: null,
  organization: null,
  clockedInUsers: [],
  userLocation: null,
  isWithinPerimeter: false,
  loading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_ORGANIZATION':
      return { ...state, organization: action.payload };
    case 'SET_CLOCKED_IN_USERS':
      return { ...state, clockedInUsers: action.payload };
    case 'SET_USER_LOCATION':
      return { ...state, userLocation: action.payload };
    case 'SET_WITHIN_PERIMETER':
      return { ...state, isWithinPerimeter: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setUser: (user: User | null) => void;
    setOrganization: (org: Organization | null) => void;
    setClockedInUsers: (users: User[]) => void;
    setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
    setWithinPerimeter: (within: boolean) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = useMemo(() => ({
    setUser: (user: User | null) => dispatch({ type: 'SET_USER', payload: user }),
    setOrganization: (org: Organization | null) => dispatch({ type: 'SET_ORGANIZATION', payload: org }),
    setClockedInUsers: (users: User[]) => dispatch({ type: 'SET_CLOCKED_IN_USERS', payload: users }),
    setUserLocation: (location: { latitude: number; longitude: number } | null) => dispatch({ type: 'SET_USER_LOCATION', payload: location }),
    setWithinPerimeter: (within: boolean) => dispatch({ type: 'SET_WITHIN_PERIMETER', payload: within }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
  }), [dispatch]);

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

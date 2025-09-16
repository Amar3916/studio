
'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import { Profile, Application, ApplicationStatus, Scholarship, User } from '@/lib/types';

// State and Action Types
type State = {
  profile: Profile;
  applications: Application[];
  user: User | null;
};

type Action =
  | { type: 'SET_PROFILE'; payload: Profile }
  | { type: 'ADD_APPLICATION'; payload: Scholarship }
  | { type: 'UPDATE_APPLICATION_STATUS'; payload: { scholarshipName: string; status: ApplicationStatus } }
  | { type: 'HYDRATE_STATE'; payload: Partial<State> }
  | { type: 'SET_USER'; payload: User | null };

const initialState: State = {
  profile: {
    academicInfo: '',
    financialInfo: '',
    achievementInfo: '',
    categoryInfo: '',
  },
  applications: [],
  user: null,
};

// Reducer
const appReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'ADD_APPLICATION':
      // Avoid adding duplicates
      if (state.applications.some(app => app.scholarship.scholarshipName === action.payload.scholarshipName)) {
        return state;
      }
      return {
        ...state,
        applications: [...state.applications, { scholarship: action.payload, status: 'Interested' }],
      };
    case 'UPDATE_APPLICATION_STATUS':
      return {
        ...state,
        applications: state.applications.map(app =>
          app.scholarship.scholarshipName === action.payload.scholarshipName
            ? { ...app, status: action.payload.status }
            : app
        ),
      };
    case 'HYDRATE_STATE':
        return { ...state, ...action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

// Context
type AppContextType = {
  state: State;
  dispatch: Dispatch<Action>;
  setProfile: (profile: Profile) => void;
  addApplication: (scholarship: Scholarship) => void;
  updateApplicationStatus: (scholarshipName: string, status: ApplicationStatus) => void;
  login: (user: User) => void;
  logout: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('scholarAIState');
      if (storedState) {
        dispatch({ type: 'HYDRATE_STATE', payload: JSON.parse(storedState) });
      }
    } catch (error) {
      console.error("Could not load state from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
        const stateToStore = {
            profile: state.profile,
            applications: state.applications,
            user: state.user
        }
      localStorage.setItem('scholarAIState', JSON.stringify(stateToStore));
    } catch (error) {
        console.error("Could not save state to localStorage", error);
    }
  }, [state]);

  const setProfile = (profile: Profile) => {
    dispatch({ type: 'SET_PROFILE', payload: profile });
  };

  const addApplication = (scholarship: Scholarship) => {
    dispatch({ type: 'ADD_APPLICATION', payload: scholarship });
  };

  const updateApplicationStatus = (scholarshipName: string, status: ApplicationStatus) => {
    dispatch({ type: 'UPDATE_APPLICATION_STATUS', payload: { scholarshipName, status } });
  };

  const login = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const logout = () => {
    dispatch({ type: 'SET_USER', payload: null });
  };

  const contextValue = {
    state,
    dispatch,
    setProfile,
    addApplication,
    updateApplicationStatus,
    login,
    logout,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

// Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return {
    profile: context.state.profile,
    applications: context.state.applications,
    user: context.state.user,
    setProfile: context.setProfile,
    addApplication: context.addApplication,
    updateApplicationStatus: context.updateApplicationStatus,
    login: context.login,
    logout: context.logout
  };
}

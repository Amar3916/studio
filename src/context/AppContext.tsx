'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import { User } from '@/lib/types';
import { SWRConfig } from 'swr';

// State and Action Types
type State = {
  user: User | null;
};

type Action =
  | { type: 'HYDRATE_STATE'; payload: Partial<State> }
  | { type: 'SET_USER'; payload: User | null };

const initialState: State = {
  user: null,
};

// Reducer
const appReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'HYDRATE_STATE':
        return { ...state, ...action.payload };
    case 'SET_USER':
      // When user logs out, clear SWR cache
      if (action.payload === null) {
        // This is a bit of a hack to clear the cache.
        // A better solution would be to use a cache provider that can be cleared.
        // But for this app, this should be fine.
        localStorage.clear();
      }
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

// Context
type AppContextType = {
  state: State;
  dispatch: Dispatch<Action>;
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
        const parsedState = JSON.parse(storedState);
        // only hydrate user state
        dispatch({ type: 'HYDRATE_STATE', payload: { user: parsedState.user } });
      }
    } catch (error) {
      console.error("Could not load state from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      const stateToStore = {
        user: state.user
      };
      localStorage.setItem('scholarAIState', JSON.stringify(stateToStore));
    } catch (error) {
        console.error("Could not save state to localStorage", error);
    }
  }, [state]);


  const login = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const logout = () => {
    dispatch({ type: 'SET_USER', payload: null });
  };

  const contextValue = {
    state,
    dispatch,
    login,
    logout,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <SWRConfig value={{
        revalidateOnFocus: false,
      }}>
        {children}
      </SWRConfig>
    </AppContext.Provider>
  );
}

// Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return {
    user: context.state.user,
    login: context.login,
    logout: context.logout
  };
}

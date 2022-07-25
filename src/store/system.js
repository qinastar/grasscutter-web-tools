import { combineReducers, createSlice } from '@reduxjs/toolkit';

export const SystemInfoReducer = createSlice({
  name: 'systemInfo',
  initialState: {
    isConnected: false,
    isConnecting: false,
    baseData: {},
    playerData: [],
  },
  reducers: {
    setConnState: (state, action) => {
      return { ...state, isConnected: action.payload };
    },
    setIsConnecting: (state, action) => {
      return { ...state, isConnecting: action.payload };
    },
    setBaseData: (state, action) => {
      return { ...state, baseData: action.payload };
    },
    setPlayerData: (state, action) => {
      return { ...state, playerData: action.payload };
    },
  },
});

const SystemReducerRoot = combineReducers({
  systemInfo: SystemInfoReducer.reducer,
});

export default SystemReducerRoot;

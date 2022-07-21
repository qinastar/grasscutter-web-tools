import { combineReducers, createSlice } from '@reduxjs/toolkit';

export const globalNavMenuReducer = createSlice({
  name: 'globalNavMenu',
  initialState: {
    siderCollapsed: false,
  },
  reducers: {
    update: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

const GlobalReducerRoot = combineReducers({
  globalNavMenu: globalNavMenuReducer.reducer,
});

export default GlobalReducerRoot;

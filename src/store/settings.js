import { combineReducers, createSlice } from '@reduxjs/toolkit';

export const GlobalNavMenuReducer = createSlice({
  name: 'globalNavMenu',
  initialState: {
    siderCollapsed: false,
    menuOpenKeys: [],
  },
  reducers: {
    update: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});
export const GrasscutterConnectionReducer = createSlice({
  name: 'grasscutterConnection',
  initialState: {
    wssUrl: '',
    autoConn: false,
  },
  reducers: {
    update: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

const SettingsReducerRoot = combineReducers({
  globalNavMenu: GlobalNavMenuReducer.reducer,
  grasscutterConnection: GrasscutterConnectionReducer.reducer,
});

export default SettingsReducerRoot;

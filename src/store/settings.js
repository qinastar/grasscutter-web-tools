import { combineReducers, createSlice } from '@reduxjs/toolkit';

export const UIPreferenceReducer = createSlice({
  name: 'uiPreference',
  initialState: {
    siderCollapsed: false,
    siderMenuOpenKeys: [],
    consoleEnterType: 'ctrl+enter',
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
  uiPreference: UIPreferenceReducer.reducer,
  grasscutterConnection: GrasscutterConnectionReducer.reducer,
});

export default SettingsReducerRoot;

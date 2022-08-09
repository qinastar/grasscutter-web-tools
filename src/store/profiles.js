import { isArray, pick } from 'lodash';
import { combineReducers, createSlice } from '@reduxjs/toolkit';

export const ArtifactFavListReducer = createSlice({
  name: 'artifactFavList',
  initialState: {
    local: [],
    localAutoIncrement: 0,
    mona: [],
  },
  reducers: {
    addLocal: (state, action) => {
      const listLocal = [...state.local];
      const aid = (state.localAutoIncrement * 1) + 1;
      listLocal.unshift({
        id: aid,
        ...action.payload,
      });
      return { ...state, local: listLocal, localAutoIncrement: aid };
    },
    removeLocal: (state, action) => {
      // payload为id
      const listLocal = [...state.local].filter((item) => item.id !== action.payload);
      return { ...state, local: listLocal };
    },
  },
});

export const WeaponFavListReducer = createSlice({
  name: 'weaponFavList',
  initialState: {
    local: [],
    localAutoIncrement: 0,
  },
  reducers: {
    addLocal: (state, action) => {
      const listLocal = [...state.local];
      const aid = (state.localAutoIncrement * 1) + 1;
      listLocal.unshift({
        id: aid,
        ...action.payload,
      });
      return { ...state, local: listLocal, localAutoIncrement: aid };
    },
    removeLocal: (state, action) => {
      // payload为id
      const listLocal = [...state.local].filter((item) => item.id !== action.payload);
      return { ...state, local: listLocal };
    },
  },
});

export const GiveAllFavListReducer = createSlice({
  name: 'giveAllFavList',
  initialState: {
    local: [],
    localAutoIncrement: 0,
  },
  reducers: {
    addLocal: (state, action) => {
      const listLocal = [...state.local];
      const aid = (state.localAutoIncrement * 1) + 1;
      listLocal.unshift({
        id: aid,
        ...action.payload,
      });
      return { ...state, local: listLocal, localAutoIncrement: aid };
    },
    removeLocal: (state, action) => {
      const listLocal = [...state.local].filter((item) => item.id !== action.payload);
      return { ...state, local: listLocal };
    },
  },
});

export const SpawnFavListReducer = createSlice({
  name: 'spawnFavList',
  initialState: {
    local: [],
    localAutoIncrement: 0,
  },
  reducers: {
    addLocal: (state, action) => {
      const listLocal = [...state.local];
      const aid = (state.localAutoIncrement * 1) + 1;
      listLocal.unshift({
        id: aid,
        ...action.payload,
      });
      return { ...state, local: listLocal, localAutoIncrement: aid };
    },
    removeLocal: (state, action) => {
      const listLocal = [...state.local].filter((item) => item.id !== action.payload);
      return { ...state, local: listLocal };
    },
  },
});

export const SystemFavCommandsReducer = createSlice({
  name: 'systemFavCommands',
  initialState: {
    local: [],
    localAutoIncrement: 100,      // 默认从100开始编号
  },
  reducers: {
    addCommand: (state, action) => {
      const listLocal = [...state.local];
      const aid = (state.localAutoIncrement * 1) + 1;
      listLocal.push({
        id: aid,
        ...action.payload,
      });
      return { ...state, local: listLocal, localAutoIncrement: aid };
    },
    removeCommands: (state, action) => {
      // payload为id[]或id
      const cmdIds = isArray(action.payload) ? action.payload : [action.payload];
      const listLocal = [...state.local].filter((item) => !cmdIds.includes(item.id));
      return { ...state, local: listLocal };
    },
    editCommand: (state, action) => {
      const id = action.payload?.id;
      if (!id) return state;
      const listLocal = [...state.local];
      const targetIndex = listLocal.findIndex((item) => item.id === id);
      if (targetIndex > -1) {
        listLocal[targetIndex] = {
          ...listLocal[targetIndex],
          ...pick(action.payload, ['name', 'command']),
        };
      }
      return { ...state, local: listLocal };
    },
  },
});

const UserProfileReducer = combineReducers({
  artifactFavList: ArtifactFavListReducer.reducer,
  weaponFavList: WeaponFavListReducer.reducer,
  giveAllFavList: GiveAllFavListReducer.reducer,
  spawnFavList: SpawnFavListReducer.reducer,
  systemFavCommands: SystemFavCommandsReducer.reducer,
});

export default UserProfileReducer;

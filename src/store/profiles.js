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

const UserProfileReducer = combineReducers({
  artifactFavList: ArtifactFavListReducer.reducer,
  weaponFavList: WeaponFavListReducer.reducer,
});

export default UserProfileReducer;

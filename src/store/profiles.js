import { combineReducers, createSlice } from '@reduxjs/toolkit';

export const ArtifactFavListReducer = createSlice({
  name: 'artifactFavList',
  initialState: {
    local: [],
    mona: [],
  },
  reducers: {
    addLocal: (state, action) => {
      const listLocal = [...state.local];
      listLocal.unshift({
        id: listLocal.length + 1,
        ...action.payload,
      });
      return { ...state, local: listLocal };
    },
    removeLocal: (state, action) => {
      // payload为id
      const listLocal = [...state.local].filter((item) => item.id !== action.payload);
      return { ...state, local: listLocal };
    },
    // TODO: add mona and remove mona
  },
});

const UserProfileReducer = combineReducers({
  artifactFavList: ArtifactFavListReducer.reducer,
});

export default UserProfileReducer;

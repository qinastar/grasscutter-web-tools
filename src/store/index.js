import { configureStore } from '@reduxjs/toolkit';
import { createRootReducer } from './reducers';

const preloadedState = {};

if (window.localStorage) {
  try {
    preloadedState.settings = JSON.parse(window.localStorage.getItem('grasscutter-web-tools-settings') || '{}');
    preloadedState.profiles = JSON.parse(window.localStorage.getItem('grasscutter-web-tools-profiles') || '{}');
  } catch (e) {
    // preloadedState.settings = {};
  }
}

export const store = configureStore({
  reducer: createRootReducer(),
  preloadedState,
});

store.subscribe(() => {
  const storeState = store.getState();
  if (storeState && window.localStorage) {
    window.localStorage.setItem('grasscutter-web-tools-settings', JSON.stringify(storeState.settings));
    window.localStorage.setItem('grasscutter-web-tools-profiles', JSON.stringify(storeState.profiles));
  }
});

if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./reducers', () => store.replaceReducer(createRootReducer()));
}

export default store;

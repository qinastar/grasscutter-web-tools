import { configureStore } from '@reduxjs/toolkit';
import { createRootReducer } from './reducers';

let preloadedState = {};

if (window.localStorage) {
  try {
    preloadedState = JSON.parse(window.localStorage.getItem('grasscutter-web-tools-profiles') || '{}');
  } catch (e) {
    preloadedState = {};
  }
}

export const store = configureStore({
  reducer: createRootReducer(),
  preloadedState: preloadedState || {},
});

store.subscribe(() => {
  const storeState = store.getState();
  if (storeState && window.localStorage) {
    window.localStorage.setItem('grasscutter-web-tools-profiles', JSON.stringify({
      global: storeState.global,
    }));
  }
});

if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./reducers', () => store.replaceReducer(createRootReducer()));
}

export default store;

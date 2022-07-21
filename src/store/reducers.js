import GlobalReducerRoot from '@/store/global';

export const createRootReducer = () => {
  return {
    global: GlobalReducerRoot,
  };
};

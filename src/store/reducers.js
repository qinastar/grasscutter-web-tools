import SettingsReducerRoot from '@/store/settings';
import SystemReducerRoot from '@/store/system';

export const createRootReducer = () => {
  return {
    settings: SettingsReducerRoot,
    system: SystemReducerRoot,
  };
};

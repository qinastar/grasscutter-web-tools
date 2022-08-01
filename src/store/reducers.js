import SettingsReducerRoot from '@/store/settings';
import SystemReducerRoot from '@/store/system';
import UserProfileReducer from '@/store/profiles';

export const createRootReducer = () => {
  return {
    settings: SettingsReducerRoot,
    system: SystemReducerRoot,
    profiles: UserProfileReducer,
  };
};

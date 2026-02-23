import { signOut } from 'firebase/auth';

import { Profile } from '@xhess/shared/schemas';

import { setAccessToken } from '@/lib/utils/auth';
import { handleErrors } from '@/lib/utils/error';

import { get_profile, post_create_profile } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { onLogin, onLogout } from '@/redux/features/userSlice';
import { store } from '@/redux/store';

import { strings } from '@/constants/strings';

const UserService = {
  createProfile: async (displayName: string, email: string): Promise<Profile> => {
    const newProfile: Profile = {
      displayName,
      email,
      createdAt: Date.now(),
      photo: null,
    };

    try {
      const response = await post_create_profile(newProfile);
      const profile = response.data;
      store.dispatch(onLogin(profile));
      sessionStorage.setItem('profile', JSON.stringify(profile));
      return profile;
    } catch (err) {
      console.error('Failed to create profile: ', err);
      throw err;
    }
  },

  refreshProfile: async () => {
    const cachedProfile = sessionStorage.getItem('profile');
    if (cachedProfile && cachedProfile !== 'undefined') {
      try {
        const parsedProfile = JSON.parse(cachedProfile) as Profile;
        store.dispatch(onLogin(parsedProfile));
        return parsedProfile;
      } catch (err) {
        console.log('Failed to parse cached profile', err);
      }
    }

    try {
      const res = await get_profile();
      const profile = res.data;
      store.dispatch(onLogin(profile));
      sessionStorage.setItem('profile', JSON.stringify(profile));
    } catch (err) {
      handleErrors(err, strings.auth.errors.loginFail);
      store.dispatch(onLogout());
      console.log('Failed to parse cached profile');
    }
  },

  logOut: async () => {
    try {
      if (!auth.currentUser) {
        return;
      }

      await signOut(auth);
      await setAccessToken(null);
      sessionStorage.removeItem('profile');
      store.dispatch(onLogout());

      window.location.href = '/';
    } catch (err) {
      console.error('Failed logout: ', err);
    }
  },

  getUserId: () => {
    return auth.currentUser?.uid;
  },
};

export default UserService;

import { CreateRoomResponse, GetRoomResponse } from '@/types/api';
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { Profile } from '@xhess/shared/schemas';

import { axiosConfig } from '@/constants/config';

import { auth } from './firebase';
import { getAccessToken } from './utils/auth';
import { handleAPIErrors } from './utils/error';

const client = axios.create(axiosConfig);

client.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    handleAPIErrors(error);
    return Promise.reject(error);
  }
);

client.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token: string | null = null;

    if (typeof window === 'undefined') {
      token = await getAccessToken();
    } else {
      const currentUser = auth.currentUser;
      if (currentUser) {
        token = await currentUser.getIdToken();
      } else {
        token = await getAccessToken();
      }
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

export function post_create_profile(profile: Profile) {
  return client.post<Profile>('/new-profile', profile);
}

export function get_profile() {
  return client.get<Profile>('/profile');
}

export function get_room(id: string) {
  return client.get<GetRoomResponse>(`/room/${id}`);
}

export function post_create_room() {
  return client.post<CreateRoomResponse>('/new-room');
}

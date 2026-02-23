import { AxiosRequestConfig } from 'axios';
import { ToastOptions } from 'react-toastify';

import { Duration } from '.';

const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.BACKEND_URL;
  }

  return process.env.NEXT_PUBLIC_BACKEND_URL;
};

export const toastConfig: ToastOptions = {
  type: 'error',
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: true,
  closeButton: false,
};

export const axiosConfig: AxiosRequestConfig = {
  baseURL: getBaseUrl(),
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: Duration.apiTimeout,
};

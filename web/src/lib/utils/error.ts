import { IInputValue } from '@/types';
import { AxiosError, isAxiosError } from 'axios';
import { FirebaseError } from 'firebase/app';
import { z } from 'zod';

import { mapAPIStatusCodeToMessage, mapAxiosCodeToMessage, mapFirebaseErrorToMessage } from '@/lib/utils/maps';

import { showErrorToast } from '@/components/common/ErrorToast';

import { strings } from '@/constants/strings';

const handleZodErrors = (
  err: z.ZodError,
  setFormState: React.Dispatch<React.SetStateAction<{ [key: string]: IInputValue }>>
) => {
  err.errors.forEach(error => {
    const field = error.path[0];
    const message = error.message;
    setFormState(prev => ({
      ...prev,
      [field]: { ...prev[field], error: message },
    }));
  });
};

const handleFirebaseError = (err: FirebaseError, title: string) => {
  const message = mapFirebaseErrorToMessage(err.code);
  showErrorToast(title, message);
};

export const handleErrors = (
  err: unknown,
  title: string,
  setFormState?: React.Dispatch<React.SetStateAction<{ [key: string]: IInputValue }>>
) => {
  if (err instanceof z.ZodError) {
    if (!setFormState) return;
    handleZodErrors(err, setFormState);
  } else if (err instanceof FirebaseError) {
    handleFirebaseError(err, title);
  } else if (err instanceof Error) {
    showErrorToast(title, err.message);
  } else {
    console.log(strings.apiError.genericMessage, err);
  }
};

export const handleAPIErrors = (error: unknown) => {
  if (!isAxiosError(error) || typeof window === 'undefined') {
    return;
  }

  const response = error.response;
  if (!response) {
    showErrorToast(strings.apiError.requestError, mapAxiosCodeToMessage(error.code));
  } else {
    showErrorToast(strings.apiError.requestFailError, mapAPIStatusCodeToMessage(response.status, response.data.error));
  }
};

export const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    return `[API_ERROR] ${error.code} status: ${error.response?.status} message: ${error.response?.data.error}`;
  } else if (error instanceof Error) {
    return `[ERROR] ${error.name} message: ${error.message}`;
  } else {
    return `[UNKNOWN] ${error}`;
  }
};

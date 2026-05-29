import { useState } from 'react';

import { IInputValue } from '@/types';
import { ZodError } from 'zod/v4';

export const useForm = () => {
  const [formState, setFormState] = useState<{ [key: string]: IInputValue }>({});
  const hasErrors = Object.values(formState).some(input => input?.error);

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (schema: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    try {
      schema.parse(value);
      setFormState(prev => ({
        ...prev,
        [name]: { value, error: undefined },
      }));
    } catch (error) {
      if (error instanceof ZodError) {
        setFormState(prev => ({
          ...prev,
          [name]: { value, error: error.issues[0].message },
        }));
      }
    }
  };
  return { formState, setFormState, handleInputChange, hasErrors };
};

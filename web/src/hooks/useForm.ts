import { useState } from 'react';

import { IInputValue } from '@/types';
import { ZodError } from 'zod/v4';

//update hook to be more precise and friendly with schema
export const useForm = () => {
  const [formState, setFormState] = useState<{ [key: string]: IInputValue }>({});
  const hasErrors = Object.values(formState).some(input => input?.error);

  const handleInputChange = (schema: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    try {
      schema.parse(value);
      setFormState(prev => ({
        ...prev,
        [e.target.name]: { value, error: undefined },
      }));
    } catch (error) {
      if (error instanceof ZodError) {
        setFormState(prev => ({
          ...prev,
          [e.target.name]: { value, error: error.issues[0].message },
        }));
      }
    }
  };
  return { formState, setFormState, handleInputChange, hasErrors };
};

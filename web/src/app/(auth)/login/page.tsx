'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { signInWithEmailAndPassword } from 'firebase/auth';

import { UserLoginSchema } from '@xhess/shared/schemas';

import { handleErrors } from '@/lib/utils/error';
import { setAccessToken } from '@/lib/utils/auth';

import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

import { useForm } from '@/hooks/useForm';
import { auth } from '@/lib/firebase';

import { strings } from '@/constants/strings';

import mailIcon from '@/../public/icons/mail.svg';
import passwordIcon from '@/../public/icons/password.svg';

export default function LoginPage() {
  const router = useRouter();
  const { formState, setFormState, handleInputChange, hasErrors } = useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const onLoginAsync = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { email, password } = UserLoginSchema.parse({
        email: formState.email?.value,
        password: formState.password?.value,
      });

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      await setAccessToken(token);

      router.push('/');
    } catch (err) {
      handleErrors(err, strings.auth.errors.loginFail, setFormState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Input
        name="email"
        type="email"
        placeholder={strings.auth.emailPlaceholder}
        onChange={handleInputChange(UserLoginSchema.shape.email)}
        input={formState.email}
        iconNode={mailIcon}
      />
      <Input
        name="password"
        type="password"
        placeholder={strings.auth.passwordPlaceholder}
        onChange={handleInputChange(UserLoginSchema.shape.password)}
        input={formState.password}
        iconNode={passwordIcon}
      />
      <Button type="submit" onClick={onLoginAsync} disabled={hasErrors || loading} isLoading={loading}>
        login
      </Button>
    </>
  );
}

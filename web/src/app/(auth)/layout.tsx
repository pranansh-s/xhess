import tw from 'tailwind-styled-components';

import Button from '@/components/common/Button';

import googleIcon from '@/../public/icons/google.svg';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Form>
      {children}
      <Divider>
        <DividerDashes />
        <span>OR</span>
        <DividerDashes />
      </Divider>

      <Button preIconNode={googleIcon} themeColor="google" type="button" isLoading={false}>
        continue with google
      </Button>
    </Form>
  );
}

const Form = tw.form`
  absolute
  left-1/2
  top-1/2
  flex
  w-[90vw]
  max-w-[468px]
  -translate-x-1/2
  -translate-y-1/2
  flex-col
  gap-8
  overflow-hidden
  rounded-3xl
  border
  border-tertiary
  bg-primary
  p-16
`;

const Divider = tw.div`
  flex
  items-center
  gap-3
  font-serif
`;

const DividerDashes = tw.div`
  flex-grow
  border-t
  border-tertiary
`;

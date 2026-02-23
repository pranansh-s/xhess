'use client';

import React, { ButtonHTMLAttributes, forwardRef, useCallback } from 'react';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { cva, VariantProps } from 'class-variance-authority';
import tw from 'tailwind-styled-components';

import { cn } from '@/lib/cn';

const buttonVariants = cva(
  `flex flex-1 justify-center font-sans items-center cursor-pointer text-black outline transition-all duration-200 ease-in-out active:translate-y-1 active:shadow-none hover:translate-y-[2px]`,
  {
    variants: {
      themeColor: {
        red: 'bg-red-300 outline-red-700 shadow-[0_6px_0_0.2px_theme(colors.red.500),0_6px_0_1.5px_theme(colors.red.700),0_12px_0_0.2px_#fca5a530] hover:shadow-[0_5px_0_0.2px_theme(colors.red.500),0_5px_0_1.5px_theme(colors.red.700)]',
        blue: 'bg-blue-300 outline-blue-700 shadow-[0_6px_0_0.2px_theme(colors.blue.500),0_6px_0_1.5px_theme(colors.blue.700),0_12px_0_0.2px_#93c5fd30] hover:shadow-[0_5px_0_0.2px_theme(colors.blue.500),0_5px_0_1.5px_theme(colors.blue.700)]',
        green:
          'bg-green-300 outline-green-700 shadow-[0_6px_0_0.2px_theme(colors.green.500),0_6px_0_1.5px_theme(colors.green.700),0_12px_0_0.2px_#86efac30] hover:shadow-[0_5px_0_0.2px_theme(colors.green.500),0_5px_0_1.5px_theme(colors.green.700)]',
        google:
          'text-white bg-[#4e8ef0] outline-[#0c52c7] shadow-[0_6px_0_0.2px_#2572f1,0_6px_0_1.5px_#0c52c7,0_12px_0_0.2px_#0c52c730] hover:shadow-[0_5px_0_0.2px_#2572f1,0_5px_0_1.5px_#0c52c7]',
      },
      size: {
        md: 'px-3 py-2 rounded-md text-base',
        lg: 'px-10 py-4 rounded-lg text-lg',
        icon: 'p-3 rounded-lg',
      },
      disabled: {
        true: '!opacity-[0.4] pointer-events-none',
        false: null,
      },
    },
    defaultVariants: {
      themeColor: 'red',
      size: 'lg',
      disabled: false,
    },
  }
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  ref?: React.Ref<HTMLButtonElement>;

  preIconNode?: StaticImport;
  postIconNode?: StaticImport;
  isLoading?: boolean;
  link?: string;
  iconSize?: number;
  disabled?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type,
      preIconNode,
      postIconNode,
      isLoading,
      link,
      iconSize,
      size,
      disabled,
      themeColor,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const router = useRouter();
    const getIconNode = (iconNode?: StaticImport) => {
      return iconNode && <Image width={iconSize ?? 24} height={iconSize ?? 24} src={iconNode} alt="" />;
    };

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (link) {
          router.push(link);
        } else if (onClick) {
          onClick(e);
        }
      },
      [link, onClick, router]
    );

    return (
      <button
        type={type}
        disabled={disabled}
        onClick={handleClick}
        ref={ref}
        className={cn(
          buttonVariants({
            themeColor,
            size,
            disabled,
          }),
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader />
        ) : (
          <>
            {getIconNode(preIconNode)}
            {children && <>&nbsp;{children}&nbsp;</>}
            {getIconNode(postIconNode)}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;

const Loader = tw.div`
  h-8
  w-8
  animate-spin
  rounded-full
  border-2
  border-dashed
  border-black
`;

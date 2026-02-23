'use client';

import { memo } from 'react';

import tw from 'tailwind-styled-components';

import { ChatMessage } from '@xhess/shared/types';

const toTime = (val: number): string => {
  const date = new Date(val);
  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  return timeString;
};

interface IMessageItemProps {
  message: ChatMessage | string;
  isUserSent: boolean;
}

const MessageItem = memo(({ message, isUserSent }: IMessageItemProps) => {
  const isError = typeof message === 'string';

  return (
    <MessageField $isErrorMessage={isError}>
      {isError ? message : <MessageContent $isUserSent={isUserSent}>{message.content}</MessageContent>}
      {!isError && <Timestamp>{toTime(message.timestamp)}</Timestamp>}
    </MessageField>
  );
});

MessageItem.displayName = 'MessageItem';
export default MessageItem;

const MessageContent = tw.span<{ $isUserSent: boolean }>`
  ${p => (p.$isUserSent ? 'text-green-300' : 'text-white')} `;

const MessageField = tw.div<{ $isErrorMessage: boolean }>`
  group
  flex
  items-center
  justify-between
  px-2
  py-1
  ${p => p.$isErrorMessage && 'text-white/30 italic'} `;

const Timestamp = tw.span`
  text-nowrap
  text-xs
  text-white
  opacity-0
  group-hover:opacity-20
`;

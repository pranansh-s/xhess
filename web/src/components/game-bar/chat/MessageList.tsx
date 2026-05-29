'use client';

import { useEffect, useRef } from 'react';

import UserService from '@/services/user.service';
import tw from 'tailwind-styled-components';

import MessageItem from '@/components/game-bar/chat/MessageItem';

import { useAppSelector } from '@/redux/hooks';

const MessageList = () => {
  const userId = UserService.getUserId();
  const chat = useAppSelector(state => state.chatState);

  const endMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.length]);

  return (
    <MessageHistory>
      {chat.map((msg, idx) => (
        <MessageItem key={idx} message={msg} isUserSent={typeof msg !== 'string' && msg.senderId === userId} />
      ))}
      <div ref={endMessageRef} />
    </MessageHistory>
  );
};

export default MessageList;

const MessageHistory = tw.div`
  flex
  flex-1
  flex-col
  overflow-y-auto
  text-zinc-300
`;

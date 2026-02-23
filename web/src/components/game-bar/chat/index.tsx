import { memo } from 'react';

import tw from 'tailwind-styled-components';

import ChatInput from './ChatInput';
import MessageList from './MessageList';

const Chat = memo(() => {
  return (
    <ChatContainer>
      <MessageList />
      <ChatInput />
    </ChatContainer>
  );
});

Chat.displayName = 'Chat';
export default Chat;

const ChatContainer = tw.div`
  flex
  h-1/3
  min-h-[150px]
  flex-col
  gap-3
  rounded-lg
  bg-zinc-800
  p-3
  font-serif
`;

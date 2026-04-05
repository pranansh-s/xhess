'use client';

import { useCallback, useState } from 'react';

import SocketService from '@/services/socket.service';
import tw from 'tailwind-styled-components';
import { ZodError } from 'zod/v4';

import { MessageSchema } from '@xhess/shared/schemas';

import { handleErrors } from '@/lib/utils/error';

import Button from '@/components/common/Button';

import { addMessage } from '@/redux/features/chatSlice';
import { useAppDispatch } from '@/redux/hooks';

import { strings } from '@/constants/strings';

import sendIcon from '@/../public/icons/send.svg';

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const dispatch = useAppDispatch();

  const handleSendMessage = useCallback(() => {
    if (!message.trim()) return;
    setIsSending(true);
    try {
      const content = MessageSchema.parse(message);
      setMessage('');
      SocketService.sendMessage(content);
    } catch (err) {
      if (err instanceof ZodError) {
        dispatch(addMessage(`~ ${err.issues[0].message} ~`));
      } else {
        handleErrors(err, 'Could not send message');
      }
    } finally {
      setIsSending(false);
    }
  }, [dispatch, message]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !isSending) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [isSending, handleSendMessage]
  );

  return (
    <InputArea>
      <InputField
        value={message}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        name="message"
        rows="1"
        placeholder={strings.room.messagePlaceholder}
      />
      <SendButton
        disabled={isSending}
        onClick={handleSendMessage}
        size="icon"
        themeColor="blue"
        preIconNode={sendIcon}
      />
    </InputArea>
  );
};

const InputArea = tw.div`
  relative
  flex
  space-x-3
  rounded-lg
  bg-zinc-600
  p-3
`;

const InputField = tw.textarea`
  flex-1
  resize-none
  bg-transparent
  p-2
  text-secondary
  focus:outline-none
`;

const SendButton = tw(Button)`
  -mt-1
  h-10
  !flex-none
`;

export default ChatInput;

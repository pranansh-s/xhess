import { Socket } from 'socket.io';

import { SocketEvent } from '@xhess/shared/types';

import { handleErrors, socketHandlers } from '../utils/socket.js';

const SocketController = (socket: Socket) => {
  const handlers = socketHandlers(socket);

  socket.on(SocketEvent.JOIN_ROOM, handleErrors(handlers.joinRoom, socket, 'Failed to join room:'));
  socket.on(
    SocketEvent.SEND_CHAT_MESSAGE,
    handleErrors(handlers.sendChatMessage, socket, 'Failed to send chat message:')
  );
  socket.on(SocketEvent.NEW_GAME, handleErrors(handlers.newGame, socket, 'Failed to create new game:'));
  socket.on(SocketEvent.SURRENDER, handleErrors(handlers.surrender, socket, 'Failed to surrender:'));
  socket.on(SocketEvent.OFFER_DRAW, handleErrors(handlers.offerDraw, socket, 'Failed to offer draw:'));
  socket.on(SocketEvent.ACCEPT_DRAW, handleErrors(handlers.acceptDraw, socket, 'Failed to accept draw:'));
  socket.on(SocketEvent.REJECT_DRAW, handleErrors(handlers.rejectDraw, socket, 'Failed to reject draw:'));
  socket.on(SocketEvent.NEW_MOVE, handleErrors(handlers.newMove, socket, 'Failed to process new move:'));
  socket.on(SocketEvent.DISCONNECT, handleErrors(handlers.disconnect, socket, 'Failed to handle disconnect:'));
};

export default SocketController;

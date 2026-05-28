import { Socket } from 'socket.io';

import { handleErrors, socketHandlers } from '../utils/socket.js';

const SocketController = (socket: Socket) => {
  const handlers = socketHandlers(socket);

  socket.on('joinRoom', handleErrors(handlers.joinRoom, socket, 'Failed to join room:'));
  socket.on('sendChatMessage', handleErrors(handlers.sendChatMessage, socket, 'Failed to send chat message:'));
  socket.on('newGame', handleErrors(handlers.newGame, socket, 'Failed to create new game:'));
  socket.on('surrender', handleErrors(handlers.surrender, socket, 'Failed to surrender:'));
  socket.on('offerDraw', handleErrors(handlers.offerDraw, socket, 'Failed to offer draw:'));
  socket.on('acceptDraw', handleErrors(handlers.acceptDraw, socket, 'Failed to accept draw:'));
  socket.on('rejectDraw', handleErrors(handlers.rejectDraw, socket, 'Failed to reject draw:'));
  socket.on('newMove', handleErrors(handlers.newMove, socket, 'Failed to process new move:'));
  socket.on('disconnect', handleErrors(handlers.disconnect, socket, 'Failed to handle disconnect:'));
};

export default SocketController;

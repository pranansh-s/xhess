export enum SocketEvent {
  // Client to Server Events
  JOIN_ROOM = 'joinRoom',
  SEND_CHAT_MESSAGE = 'sendChatMessage',
  NEW_GAME = 'newGame',
  NEW_MOVE = 'newMove',
  SURRENDER = 'surrender',
  OFFER_DRAW = 'offerDraw',
  ACCEPT_DRAW = 'acceptDraw',
  REJECT_DRAW = 'rejectDraw',

  // Server to Client Events
  ERROR = 'error',
  RECEIVE_CHAT_MESSAGE = 'receiveChatMessage',
  GAME_JOINED = 'gameJoined',
  MOVE_UPDATE = 'moveUpdate',
  DRAW_OFFER_REJECTED = 'drawOfferRejected',

  // Built-in Socket.IO Events
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
}

export enum SocketEvent {
  JOIN_ROOM = 'joinRoom',
  SEND_CHAT_MESSAGE = 'sendChatMessage',
  NEW_GAME = 'newGame',
  NEW_MOVE = 'newMove',
  SURRENDER = 'surrender',
  OFFER_DRAW = 'offerDraw',
  ACCEPT_DRAW = 'acceptDraw',
  REJECT_DRAW = 'rejectDraw',

  ERROR = 'error',
  RECEIVE_CHAT_MESSAGE = 'receiveChatMessage',
  GAME_JOINED = 'gameJoined',
  MOVE_UPDATE = 'moveUpdate',
  DRAW_OFFER_REJECTED = 'drawOfferRejected',

  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
}

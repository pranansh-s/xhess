import 'dotenv/config';

import { createServer } from 'http';

import express from 'express';
import helmet from 'helmet';

import { configSocket } from './config.js';
import SocketController from './controllers/socket.controller.js';
import { appCors, appRateLimiter, handleRouteErrors } from './middleware.js';
import profileRoutes from './routes/profile.router.js';
import roomRoutes from './routes/room.router.js';

const app = express();
const server = createServer(app);
const io = configSocket(server);

io.on('connection', SocketController);

app.use(appCors);
app.use(appRateLimiter);
app.use(helmet());
app.use(express.json());

app.use(roomRoutes);
app.use(profileRoutes);

app.use(handleRouteErrors);

const PORT = process.env.PORT ?? 8080;

const router = express.Router();

router.get('/health', (_, res) => {
  res.status(200).send('OK');
});

app.use(router);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

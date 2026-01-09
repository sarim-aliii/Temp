import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { configurePassport } from './config/passport';
import { createServer } from 'http';
import { Server } from 'socket.io';
// import { createClient } from 'redis';
// import { createAdapter } from '@socket.io/redis-adapter';
import connectDB from './db';
import Logger from './utils/logger';
import { initSocketServer } from './sockets';


// Routes
import authRoutes from './routes/auth';
import pairingRoutes from './routes/pairing';
import journalRoutes from './routes/journal';
import paymentRoutes from './routes/payment';
import videoRoutes from './routes/video';
import waitlistRoutes from './routes/waitlist';
import postRoutes from './routes/posts';

// --- Connect to Database ---
connectDB();

const app = express();


// 1. Helmet: Sets various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://picsum.photos", "https://*.googleusercontent.com"],
      frameSrc: ["'self'", "https://www.youtube.com"],
      scriptSrc: ["'self'"], 
      upgradeInsecureRequests: [],
    },
  },
}));

// 2. Rate Limiting: Prevent brute-force on Auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- General Middleware ---
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
configurePassport(passport);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('❌ Malformed JSON received:', err.message);
    return res.status(400).json({ success: false, message: 'Invalid JSON payload received' });
  }
  next();
});

// --- HTTP Server & Socket.IO Setup ---
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});


// --- Redis Adapter Configuration ---
// const REDIS_URL = process.env.REDIS_URL;

// if (REDIS_URL) {
//   // Create a separate client for Pub and Sub (required by the adapter)
//   const pubClient = createClient({ url: REDIS_URL });
//   const subClient = pubClient.duplicate();

//   Promise.all([pubClient.connect(), subClient.connect()])
//     .then(() => {
//       io.adapter(createAdapter(pubClient, subClient));
//       Logger.info(`✅ Redis Adapter attached. Connected to ${REDIS_URL}`);
//     })
//     .catch((err) => {
//       Logger.error('❌ Redis Connection Failed. Falling back to memory adapter.', err);
//     });

//   // Handle Redis Errors
//   pubClient.on('error', (err) => Logger.error('Redis Pub Client Error', err));
//   subClient.on('error', (err) => Logger.error('Redis Sub Client Error', err));
// } else {
//   Logger.info('ℹ️  No REDIS_URL provided. Using default in-memory adapter.');
// }

const PORT = process.env.PORT || 8080;

// --- API Routes ---
// Apply rate limiter specifically to auth routes
app.use('/api/auth', authLimiter, authRoutes);

app.use('/api/pairing', pairingRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/posts', postRoutes);

// --- Initialize Sockets ---
initSocketServer(io);

httpServer.listen(PORT, () => {
  Logger.info(`BlurChat server listening on port ${PORT}`);
});
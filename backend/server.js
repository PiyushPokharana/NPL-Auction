require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const connectDB = require('./config/db');
const attachSocketHandlers = require('./sockets/socketHandlers');

const playerRoutes = require('./routes/playerRoutes');
const teamRoutes = require('./routes/teamRoutes');
const bidRoutes = require('./routes/bidRoutes');
const auctionRoutes = require('./routes/auctionRoutes');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

connectDB();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/bid', bidRoutes);
app.use('/api/auction', auctionRoutes);

const io = new Server(server, {
    cors: {
        origin: CLIENT_ORIGIN,
        methods: ['GET', 'POST', 'PUT']
    }
});

app.set('io', io);
attachSocketHandlers(io);

app.use((error, req, res, next) => {
    console.error('[Server Error]', {
        message: error.message,
        stack: error.stack
    });
    res.status(500).json({ message: 'Something went wrong. Please refresh.' });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

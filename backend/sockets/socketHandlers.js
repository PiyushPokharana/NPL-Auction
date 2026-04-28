const { placeBid } = require('../controllers/bidController');
const { startAuction, acceptBid, rejectBid } = require('../controllers/auctionController');

const createMockRes = (socket) => {
    return {
        status: function (code) {
            this.statusCode = code;
            return this;
        },
        json: function (data) {
            if (this.statusCode >= 400 && data.message) {
                socket.emit('errorMessage', { message: data.message });
            }
            return data;
        }
    };
};

const attachSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        socket.on('placeBid', async (payload) => {
            const req = { body: payload, app: { get: () => io } };
            const res = createMockRes(socket);

            await placeBid(req, res, (error) => {
                if (error) {
                    console.error('[Socket placeBid] handler error', error);
                    socket.emit('errorMessage', { message: 'Something went wrong. Please refresh.' });
                }
            });
        });

        socket.on('startAuction', async (payload) => {
            const req = { body: payload, app: { get: () => io } };
            const res = createMockRes(socket);

            await startAuction(req, res, (error) => {
                if (error) {
                    console.error('[Socket startAuction] handler error', error);
                    socket.emit('errorMessage', { message: 'Something went wrong. Please refresh.' });
                }
            });
        });

        socket.on('acceptBid', async (payload) => {
            const req = { body: payload, app: { get: () => io } };
            const res = createMockRes(socket);

            await acceptBid(req, res, (error) => {
                if (error) {
                    console.error('[Socket acceptBid] handler error', error);
                    socket.emit('errorMessage', { message: 'Something went wrong. Please refresh.' });
                }
            });
        });

        socket.on('rejectBid', async (payload) => {
            const req = { body: payload, app: { get: () => io } };
            const res = createMockRes(socket);

            await rejectBid(req, res, (error) => {
                if (error) {
                    console.error('[Socket rejectBid] handler error', error);
                    socket.emit('errorMessage', { message: 'Something went wrong. Please refresh.' });
                }
            });
        });

        socket.on('error', (err) => {
            console.error('Socket error on', socket.id, err);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        });
    });
};

module.exports = attachSocketHandlers;

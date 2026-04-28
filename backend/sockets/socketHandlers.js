const { placeBid } = require('../controllers/bidController');
const { startAuction, acceptBid, rejectBid } = require('../controllers/auctionController');

const createMockRes = (socket) => {
    return {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
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
                if (error) socket.emit('errorMessage', { message: error.message });
            });
        });

        socket.on('startAuction', async (payload) => {
            const req = { body: payload, app: { get: () => io } };
            const res = createMockRes(socket);

            await startAuction(req, res, (error) => {
                if (error) socket.emit('errorMessage', { message: error.message });
            });
        });

        socket.on('acceptBid', async (payload) => {
            const req = { body: payload, app: { get: () => io } };
            const res = createMockRes(socket);

            await acceptBid(req, res, (error) => {
                if (error) socket.emit('errorMessage', { message: error.message });
            });
        });

        socket.on('rejectBid', async (payload) => {
            const req = { body: payload, app: { get: () => io } };
            const res = createMockRes(socket);

            await rejectBid(req, res, (error) => {
                if (error) socket.emit('errorMessage', { message: error.message });
            });
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        });
    });
};

module.exports = attachSocketHandlers;

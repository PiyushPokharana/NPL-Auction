const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri || mongoUri.includes('<user>')) {
        console.warn('MONGO_URI not configured. Running without MongoDB connection.');
        return;
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected');
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connection: connected');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('Mongoose connection: disconnected');
        });
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
    }
};

module.exports = connectDB;

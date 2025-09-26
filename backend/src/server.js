require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskdb';

async function start() {
    try {
        await mongoose.connect(MONGO_URI, { });
        console.log('Connected to MongoDB');
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
        server.on('error', (err) => console.error('Server error:', err));
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

// Global process handlers (uma vez só aqui)
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

start();
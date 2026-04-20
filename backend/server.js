const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { generalLimiter, authLimiter } = require('./middleware/ratelimiter');

require('dotenv').config();

const setupRoutes = require('./routes/setupRoutes');

if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not defined in .env');
    process.exit(1);
}

const app = express();
app.use(helmet());
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express.json());
app.use(generalLimiter);

setupRoutes(app);

app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})


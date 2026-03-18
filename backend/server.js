const express = require('express');
const cors = require('cors');
require('dotenv').config();

const setupRoutes = require('./routes/setupRoutes');

if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not defined in .env');
    process.exit(1);
}

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

setupRoutes(app);

app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})


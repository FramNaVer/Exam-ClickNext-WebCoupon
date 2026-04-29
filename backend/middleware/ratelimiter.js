const raterimit = require('express-rate-limit');

//General rate limiter for all requests
const generalLimiter = raterimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { 
        status: 429, 
        message: 'Too many requests, please try again later.' 
    }
})

//Specific rate limiter for authentication routes
const authLimiter = raterimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: { 
        status: 429, 
        message: 'Too many login attempts, please try again later.' 
    }
})

module.exports = { generalLimiter, authLimiter };
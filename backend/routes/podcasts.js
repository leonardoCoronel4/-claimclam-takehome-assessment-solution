const express = require('express');
const { query, validationResult } = require('express-validator');
const rateLimit = require("express-rate-limit");
const router = express.Router();
const { fetchPodcastData } = require('../services/podcastService');

const podcastsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // max 30 podcast requests per 5 minutes
  message: {
    error: 'Too many podcast requests from this IP',
    message: 'Please wait 5 minutes before making more requests',
    retryAfter: 300 // 5 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Logging para monitoreo
  handler: (req, res, next, options) => {
   // console.log(`Podcast rate limit reached for IP: ${req.ip} at ${new Date().toISOString()}`);
   res.status(options.statusCode).json(options.message);
  }
});

// Aplicar rate limiting a todas las rutas de podcasts
router.use(podcastsLimiter);

router.get('/',
    query('search').optional().isString().trim(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                errors: errors.array(),
                message: 'Invalid request parameters'
            });
        }
        try {
            const startTime = Date.now();
            const data = await fetchPodcastData(req.query);
            const responseTime = Date.now() - startTime;
            // Log para monitoreo de rendimiento
            //console.log(`Podcast request completed in ${responseTime}ms for IP: ${req.ip}`);
            
            // Agregar headers informativos
            res.set({
                'X-Response-Time': `${responseTime}ms`,
                'X-Total-Results': data.podcasts ? data.podcasts.length : 0
            });
            
            res.status(200).json(data);
        } catch (error) {
            console.error(`Podcast fetch error for IP ${req.ip}:`, error.message);
            res.status(500).json({ 
                error: 'Something went wrong',
                message: 'Unable to fetch podcast data at this time'
            });
        }
    }
);

module.exports = router;
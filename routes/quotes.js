/*
Name: Isaac Euceda
Date: 2026-04-21
CSC 372-01
Description: This file contains the routes for fetching random quotes in the Save It application. The GET /quotes route fetches a random quote from the ZenQuotes API and returns it as JSON. If the API request fails, it returns a random fallback quote from a predefined list.
*/
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const response = await fetch('https://zenquotes.io/api/random');
        if (!response.ok) {
            throw new Error('Failed to fetch quote');
        }
        const data = await response.json();
        const quote = data[0];
        // res.json({ text: quote.q, author: quote.a });
        
    res.json({ text: quote.q, author: quote.a });
    } catch (err) {
        const fallbacks = [
            { text: "Don't watch the clock; do what it does. Keep going.", author: 'Sam Levenson' },
            { text: "The future depends on what you do today.", author: 'Mahatma Gandhi' },
            { text: "It always seems impossible until it's done.", author: 'Nelson Mandela' },
        ];
        const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        res.json(fallback);
    }

});

module.exports = router;
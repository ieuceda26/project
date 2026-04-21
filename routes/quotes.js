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
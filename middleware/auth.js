/*
Name: Isaac Euceda
Date: 2026-04-21
CSC 372-01
Description: This file contains middleware functions for authentication in the Save It application. The requireAuth function is used to protect API routes by checking if the user is logged in, while the requireAuthPage function is used to protect page routes by redirecting unauthenticated users to the login page.
*/
// Middleware to protect API routes
function requireAuth(req, res, next) {
if (req.session && req.session.userId) {
return next();
}
res.status(401).json({ error: 'Please log in to continue' });
}

// Middleware to protect page routes (redirects to login)
function requireAuthPage(req, res, next) {
if (req.session && req.session.userId) {
return next();
}
res.redirect('/login');
}

module.exports = { requireAuth, requireAuthPage };
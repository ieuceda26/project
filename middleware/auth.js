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
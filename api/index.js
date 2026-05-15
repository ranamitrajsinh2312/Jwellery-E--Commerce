// Vercel serverless entry point — handles /api/* routes only.
// Static frontend files are served directly by Vercel CDN from api/dist.
const app = require('../backend/server');

module.exports = app;

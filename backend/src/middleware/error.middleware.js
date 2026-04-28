// Wraps async route handlers so thrown errors are passed to Express's
// error middleware instead of crashing the process.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Global error formatter
function errorMiddleware(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error('[error]', err.stack || err.message || err);
  const status = err.status || err.statusCode || 500;
  const body = {
    error: err.message || 'Internal server error',
  };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    body.stack = err.stack.split('\n').slice(0, 5);
  }
  res.status(status).json(body);
}

// 404 handler (mount after all routes)
function notFoundHandler(req, res) {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { asyncHandler, errorMiddleware, notFoundHandler };

const validate = (schema, source = "body") => (req, res, next) => {
  try {
    const parsed = schema.parse(req[source]);
    req[source] = parsed;
    next();
  } catch (err) {
    const issues = err.issues || err.errors || [];
    return res.status(400).json({
      message: "Validation failed",
      errors: issues.map((i) => ({ path: (i.path || []).join("."), message: i.message })),
    });
  }
};

const errorHandler = (err, _req, res, _next) => {
  console.error("API Error:", err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
};

const notFound = (req, res) => res.status(404).json({ message: "Resource not found" });

module.exports = { validate, errorHandler, notFound };

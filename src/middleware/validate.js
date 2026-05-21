export const validate = (schema) => (req, res, next) => {
  try {
    const hasKeys = schema.shape && (schema.shape.body || schema.shape.query || schema.shape.params);
    if (hasKeys) {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;
    } else {
      req.body = schema.parse(req.body);
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default validate;

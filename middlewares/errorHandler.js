export const errorHandler = async (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err.message);
};

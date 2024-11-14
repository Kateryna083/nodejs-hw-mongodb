import createHttpError from 'http-errors';

export const authenticate = async (req, res, next) => {
  //   const { authorization } = req.headers;
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    return next(createHttpError(401, 'Authorization header missing'));
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer') {
    return next(
      createHttpError(401, 'Authorization header must be type Bearer'),
    );
  }
};

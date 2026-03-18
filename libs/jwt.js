import jwt from 'jsonwebtoken';

export function createAccessToken(payload) {
  return jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: '1d',
  });
}

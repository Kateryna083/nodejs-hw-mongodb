import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

import UserCollection from '../db/models/User.js';
import SessionCollection from '../db/models/Session.js';

import {
  accessTokenLifetime,
  refreshTokenLifetime,
} from '../constants/users.js';
import { SMTP } from '../constants/index.js';

import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendMail.js';

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: Date.now() + accessTokenLifetime,
    refreshTokenValidUntil: Date.now() + refreshTokenLifetime,
  };
};

export const register = async (payload) => {
  const { email, password } = payload;
  const user = await UserCollection.findOne({ email });
  if (user) {
    throw createHttpError(409, 'Email already in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  return UserCollection.create({ ...payload, password: hashPassword });
};

export const login = async ({ email, password }) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Email or password invalid');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw createHttpError(401, 'Email or password invalid');
  }

  await SessionCollection.deleteOne({ userId: user._id });

  const newSession = createSession();

  return SessionCollection.create({
    userId: user._id,
    ...newSession,
  });
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionCollection.findOne({
    _id: sessionId,
    refreshToken,
  });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }
  if (Date.now() > session.refreshTokenValidUntil) {
    throw createHttpError(401, 'Session token expired');
  }

  await SessionCollection.deleteOne({ _id: session._id });

  const newSession = createSession();

  return SessionCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logout = (sessionId) =>
  SessionCollection.deleteOne({ _id: sessionId });

export const findSession = (filter) => SessionCollection.findOne(filter);

export const findUser = (filter) => UserCollection.findOne(filter);

export const requestResetToken = async (email) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env('JWT_SECRET'),
    {
      expiresIn: '5m',
    },
  );

  // Формування URL для скидання паролю
  const resetLink = `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`;

  await sendEmail({
    from: env(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password!</p>`,
  });
};

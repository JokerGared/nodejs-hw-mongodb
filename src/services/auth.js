import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';
import { User } from '../db/models/user.js';
import bcrypt from 'bcrypt';
import { Session } from '../db/models/session.js';
import { time } from '../constants/timeCounts.js';

const createSession = () => {
  return {
    accessToken: randomBytes(30).toString('base64'),
    refreshToken: randomBytes(30).toString('base64'),
    accessTokenValidUntil: new Date(Date.now() + time.FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + time.THIRTY_DAYS),
  };
};

export const registerUser = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email });

  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await User.create({
    ...payload,
    password: hashedPassword,
  });
  return user;
};

export const loginUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });

  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  const isPasswordMatches = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatches) {
    throw createHttpError(401, 'Unauthorized');
  }

  await Session.findOneAndDelete({ userId: user._id });

  return await Session.create({
    userId: user._id,
    ...createSession(),
  });
};

export const logoutUser = async (sessionId, refreshToken) => {
  await Session.findOneAndDelete({ _id: sessionId, refreshToken });
};

export const refreshSession = async (sessionId, refreshToken) => {
  const session = await Session.findOne({
    _id: sessionId,
    refreshToken: refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (session.refreshTokenValidUntil < new Date()) {
    await Session.findByIdAndDelete(sessionId);
    throw createHttpError(401, 'Session expired');
  }

  await Session.findByIdAndDelete(sessionId);

  return await Session.create({
    userId: session.userId,
    ...createSession(),
  });
};

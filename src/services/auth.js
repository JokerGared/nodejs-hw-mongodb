import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { User } from '../db/models/user.js';
import bcrypt from 'bcrypt';
import { Session } from '../db/models/session.js';
import { time } from '../constants/timeCounts.js';
import { sendMail } from '../utils/sendMail.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { envVars } from '../constants/envVars.js';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs';
import { TEMPLATE_DIR } from '../constants/paths.js';

const resetPasswordTemplate = fs
  .readFileSync(path.join(TEMPLATE_DIR, 'reset-password-email.html'), 'utf-8')
  .toString();

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

export const requestReset = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    createHttpError(404, 'User not found');
  }

  const template = handlebars.compile(resetPasswordTemplate);

  const token = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar(envVars.JWT_SECRET),
    {
      expiresIn: '5m',
    },
  );

  const html = template({
    name: user.name,
    link: `${getEnvVar(envVars.APP_DOMAIN)}/reset-password?token=${token}`,
  });

  try {
    await sendMail({ email, html, subject: 'Reset your password!' });
  } catch (error) {
    console.error(error);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async ({ token, password }) => {
  let tokenPayload;

  try {
    tokenPayload = jwt.verify(token, getEnvVar(envVars.JWT_SECRET));
  } catch (error) {
    console.error(error);
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await User.findOne({
    _id: tokenPayload.sub,
    email: tokenPayload.email,
  });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.findByIdAndUpdate(tokenPayload.sub, { password: hashedPassword });

  await Session.findOneAndDelete({ userId: tokenPayload.sub });
};

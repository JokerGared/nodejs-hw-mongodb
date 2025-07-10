import {
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from '../services/auth.js';

const setupSessionCookies = (session, res) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.cookie('sessionId', session._id.toString(), {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });
};

const clearSessionCookies = (res) => {
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');
};

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  setupSessionCookies(session, res);

  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken: session.accessToken },
  });
};

export const logoutUserController = async (req, res) => {
  const { refreshToken, sessionId } = req.cookies;
  await logoutUser(sessionId, refreshToken);
  clearSessionCookies(res);

  res.status(204).end();
};

export const refreshSessionController = async (req, res, next) => {
  const { refreshToken, sessionId } = req.cookies;

  try {
    const session = await refreshSession(sessionId, refreshToken);

    setupSessionCookies(session, res);

    res.json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: { accessToken: session.accessToken },
    });
  } catch (error) {
    if (error.status === 401) {
      clearSessionCookies(res);
    }
    next(error);
  }
};

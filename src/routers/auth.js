import { Router } from 'express';
import {
  loginUserController,
  logoutUserController,
  refreshSessionController,
  registerUserController,
  requestResetController,
  resetPasswordController,
} from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema } from '../validation/registerUser.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { loginUserSchema } from '../validation/loginUser.js';
import { requestResetSchema } from '../validation/request-reset-schema.js';
import { resetPasswordSchema } from '../validation/reset-password-schema.js';

const authRouter = Router();

authRouter.post(
  '/auth/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);
authRouter.post(
  '/auth/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUserController),
);
authRouter.post('/auth/logout', ctrlWrapper(logoutUserController));
authRouter.post('/auth/refresh', ctrlWrapper(refreshSessionController));
authRouter.post(
  '/auth/send-reset-email',
  validateBody(requestResetSchema),
  ctrlWrapper(requestResetController),
);
authRouter.post(
  '/auth/reset-pwd',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController),
);

export default authRouter;

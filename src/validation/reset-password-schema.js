import Joi from 'joi';

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().required().min(4),
});

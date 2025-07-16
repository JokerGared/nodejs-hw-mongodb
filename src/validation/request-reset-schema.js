import Joi from 'joi';

export const requestResetSchema = Joi.object({
  email: Joi.string().email().required(),
});

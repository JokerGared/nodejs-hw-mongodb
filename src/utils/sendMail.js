import { createTransport } from 'nodemailer';
import { getEnvVar } from './getEnvVar.js';
import { envVars } from '../constants/envVars.js';
import createHttpError from 'http-errors';

const mailClient = createTransport({
  host: getEnvVar(envVars.SMTP_HOST),
  port: getEnvVar(envVars.SMTP_PORT),
  auth: {
    user: getEnvVar(envVars.SMTP_USER),
    pass: getEnvVar(envVars.SMTP_PASS),
  },
});

export const sendMail = async ({ email, html, subject }) => {
  try {
    console.log('[SERVICE] Починаємо відправку листа на:', email);
    const result = await mailClient.sendMail({
      to: email,
      subject,
      html,
      from: getEnvVar(envVars.SMTP_FROM),
    });
    console.log('[EMAIL SEND RESULT]:', result);
    return result;
  } catch (error) {
    console.error(error);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

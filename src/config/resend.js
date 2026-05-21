import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY || 're_mockkey';
export const resend = new Resend(resendApiKey);

export default resend;

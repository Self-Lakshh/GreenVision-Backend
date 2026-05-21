import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_nirmalcarbonkeyid',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'razorpay_key_secret_nirmalcarbonsecret',
});

export default razorpay;

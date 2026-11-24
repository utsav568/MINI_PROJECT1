import express from 'express';
import { createPaymentOrder, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const paymentRouter = express.Router();

paymentRouter.post('/create-order', protect, createPaymentOrder);
paymentRouter.post('/verify', protect, verifyPayment);

export default paymentRouter;

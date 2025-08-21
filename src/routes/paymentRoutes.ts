import { Router } from 'express';
import { createPayment, getPayments, handleWebhook, handleSuccess, handleCancel } from '../controllers/paymentController.js';

const router = Router();
router.post('/checkout', createPayment);
router.get('/payments', getPayments);
router.post('/webhooks', handleWebhook);
router.get('/success', handleSuccess);
router.get('/cancel', handleCancel);

export default router;
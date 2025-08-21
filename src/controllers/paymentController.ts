import type { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService.js';

const paymentService = new PaymentService();

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { userId, amount, planId } = req.body;
    if (!userId || !amount || !planId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const checkoutUrl = await paymentService.createCheckout(userId, amount, planId);
    res.status(201).json({ checkoutUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error creating checkout', error });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'Missing userId' });
    }
    const payments = await paymentService.getPayments(userId as string);
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const success = await paymentService.handleWebhook(req.body, signature);
    if (success) {
      res.status(200).send('Webhook processed');
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Error processing webhook', error });
  }
};

export const handleSuccess = async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.session_id as string;
    if (!sessionId) {
      return res.status(400).json({ message: 'Missing session_id' });
    }
    // Sử dụng PaymentService để lấy thông tin thanh toán
    const payments = await paymentService.getPaymentsBySessionId(sessionId);
    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json({ message: 'Payment successful', payment: payments[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error processing success', error });
  }
};

export const handleCancel = async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.session_id as string;
    if (sessionId) {
      // Tùy chọn: Cập nhật trạng thái thành 'failed' nếu cần
      await paymentService.updatePaymentStatus(sessionId, 'failed');
    }
    res.status(200).json({ message: 'Payment cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing cancel', error });
  }
};
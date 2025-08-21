import Stripe from 'stripe';
import { Pool } from 'pg';
import type { Payment } from '../models/payment.js';
import { verifySignature } from '../utils/webhook.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-07-30.basil' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export class PaymentService {
  async createCheckout(userId: string, amount: number, planId: string): Promise<string> {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `Plan ${planId}` },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Sửa URL để trỏ đến API endpoints
      success_url: 'http://localhost:3000/api/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/api/cancel?session_id={CHECKOUT_SESSION_ID}',
      client_reference_id: userId,
    });

    await pool.query(
      'INSERT INTO payments (user_id, amount, plan_id, stripe_id, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [userId, amount, planId, session.id, 'pending']
    );
    return session.url || '';
  }

  async getPayments(userId: string): Promise<Payment[]> {
    const result = await pool.query('SELECT * FROM payments WHERE user_id = $1', [userId]);
    return result.rows;
  }

  async getPaymentsBySessionId(sessionId: string): Promise<Payment[]> {
    const result = await pool.query('SELECT * FROM payments WHERE stripe_id = $1', [sessionId]);
    return result.rows;
  }

  async updatePaymentStatus(sessionId: string, status: 'pending' | 'completed' | 'failed'): Promise<void> {
    await pool.query('UPDATE payments SET status = $1 WHERE stripe_id = $2', [status, sessionId]);
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<boolean> {
    try {
      const event = stripe.webhooks.constructEvent(
        payload, 
        signature, 
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.updatePaymentStatus(session.id, 'completed');
        console.log(`Payment completed for session: ${session.id}`);
      }

      return true;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }
}
import crypto from 'crypto';

export function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
  const hmac = crypto.createHmac('sha256', secret);
  const computedSignature = `v1,${hmac.update(payload).digest('hex')}`;
  return computedSignature === signature;
}
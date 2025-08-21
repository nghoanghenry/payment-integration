export interface Payment {
  id?: string;
  userId: string;
  amount: number;
  planId: string;
  stripeId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}
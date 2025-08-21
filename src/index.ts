import express from 'express';
import dotenv from 'dotenv';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();
const app = express();

app.use('/api/webhooks', express.raw({ type: 'application/json' }));

app.use(express.json());

app.use('/api', paymentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
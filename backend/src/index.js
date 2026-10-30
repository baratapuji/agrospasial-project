require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/errorMiddleware');

// Import Routes
const authRoutes = require('./routes/admin/authRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');
const spatialRoutes = require('./routes/admin/spatialRoutes');
const categoryRoutes = require('./routes/admin/categoryRoutes');
const productRoutes = require('./routes/admin/productRoutes');
const shopRoutes = require('./routes/admin/shopRoutes');
const userRoutes = require('./routes/admin/userRoutes');
const orderRoutes = require('./routes/admin/orderRoutes');
const auditRoutes = require('./routes/admin/auditRoutes');
const settingRoutes = require('./routes/admin/settingRoutes');

const sellerRoutes = require('./routes/seller/sellerRoutes');

const paymentRoutes = require('./routes/payment/paymentRoutes');
const webhookRoutes = require('./routes/payment/webhookRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Online',
    system: 'AgroSpasial Modular Backend API',
    version: '1.0.0',
  });
});

// API Routes Mapping
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/spatial', spatialRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/shops', shopRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/settings', settingRoutes)
app.use('/api/seller', sellerRoutes)
app.use('/api/payments', paymentRoutes);
app.use('/api/payments/webhook', webhookRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server AgroSpasial berjalan di http://localhost:${PORT}`);
});
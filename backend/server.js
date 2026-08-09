const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');

dotenv.config();
const app = express();
app.use(express.json());
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/shipments', shipmentRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
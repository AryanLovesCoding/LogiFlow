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
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const dispatchRoutes = require('./routes/dispatchRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const logsRoutes = require('./routes/logsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/shipments', shipmentRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/drivers', driverRoutes)
app.use('/api/dispatches', dispatchRoutes)
app.use('/api/analytics', analyticsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tickets', ticketRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database');
const authRoutes = require('./routes/auth');
const residentRoutes = require('./routes/residents');
const hostelRoutes = require('./routes/hostels');
const roomRoutes = require('./routes/rooms');
const allotmentRoutes = require('./routes/allotments');
const messPlanRoutes = require('./routes/messPlans');
const billRoutes = require('./routes/bills');
const paymentRoutes = require('./routes/payments');
const maintenanceRoutes = require('./routes/maintenance');
const laundryRoutes = require('./routes/laundry');
const residentPortalRoutes = require('./routes/residentPortal');
const visitorRoutes = require('./routes/visitorLogs');
const accessCardRoutes = require('./routes/accessCards');
const preferenceRoutes = require('./routes/preferences');
const viewsRoutes = require('./routes/views');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/allotments', allotmentRoutes);
app.use('/api/mess-plans', messPlanRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/laundry', laundryRoutes);
app.use('/api/resident-portal', residentPortalRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/access-cards', accessCardRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/views', viewsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();


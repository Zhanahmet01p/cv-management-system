const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();
require('./passport');

const attributeRoutes = require('./routes/attributeRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const positionRoutes = require('./routes/positionRoutes');
const cvRoutes = require('./routes/cvRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(passport.initialize());

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'API Service is active' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running smoothly' });
});

app.use('/api/auth', authRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/cvs', cvRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
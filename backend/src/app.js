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

app.use(cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/cvs', cvRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running smoothly' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
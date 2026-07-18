const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret';
const isGoogleAuthEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

router.get('/google', (req, res, next) => {
  if (!isGoogleAuthEnabled) {
    return res.status(501).json({ error: 'Google OAuth is not configured' });
  }
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
  if (!isGoogleAuthEnabled) {
    return res.status(501).json({ error: 'Google OAuth is not configured' });
  }
  next();
}, passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, role: req.user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
  }
);

router.post('/login', async (req, res) => {
  const { email, role = 'CANDIDATE', firstName, lastName } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!['CANDIDATE', 'RECRUITER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const { prisma } = require('../db');

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          role,
          firstName: firstName || 'Demo',
          lastName: lastName || 'User',
          photoUrl: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=150&h=150&fit=crop&crop=face'
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { prisma } = require('../db');
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Mock/Dev Login for local testing across all roles
router.post('/dev-login', async (req, res) => {
  const { role, email } = req.body;
  if (!role || !['CANDIDATE', 'RECRUITER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Invalid or missing role' });
  }

  const defaultEmail = email || `demo-${role.toLowerCase()}@example.com`;
  const { prisma } = require('../db');

  try {
    let user = await prisma.user.findUnique({
      where: { email: defaultEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: defaultEmail,
          role: role,
          firstName: 'Demo',
          lastName: role.charAt(0) + role.slice(1).toLowerCase(),
          location: 'New York, USA',
          photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        }
      });
    } else if (user.role !== role) {
      // Allow changing role for demo users to match testing needs
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role }
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mock Social Login redirect/flow handler
router.post('/social-mock', async (req, res) => {
  const { provider, email } = req.body;
  if (!provider || !email) {
    return res.status(400).json({ error: 'Provider and email are required' });
  }

  const { prisma } = require('../db');
  const role = 'CANDIDATE'; // Default role for new signups

  try {
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          role,
          firstName: 'Social',
          lastName: 'User',
          photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
          googleId: provider === 'google' ? `mock-google-${Date.now()}` : null,
          facebookId: provider === 'facebook' ? `mock-fb-${Date.now()}` : null
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

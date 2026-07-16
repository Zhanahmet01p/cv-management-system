const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret';

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, create JWT
    const token = jwt.sign(
      { id: req.user.id, role: req.user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with token (or set cookie)
    res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}`);
  }
);

router.get('/me', async (req, res) => {
  // Logic to verify token and return user info
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

module.exports = router;

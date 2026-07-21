const express   = require('express');
const passport  = require('passport');
const jwt       = require('jsonwebtoken');
const bcrypt    = require('bcrypt');
const router    = express.Router();

const { prisma } = require('../db');

const JWT_SECRET          = process.env.JWT_SECRET || 'your-very-secure-secret';
const FRONTEND_URL        = process.env.FRONTEND_URL || 'http://localhost:5173';
const isGoogleAuthEnabled   = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const isFacebookAuthEnabled = Boolean(process.env.FACEBOOK_APP_ID  && process.env.FACEBOOK_APP_SECRET);

const makeToken = (user) => jwt.sign(
  { id: user.id, role: user.role },
  JWT_SECRET,
  { expiresIn: '7d' }
);



router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, role = 'CANDIDATE' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (!['CANDIDATE', 'RECRUITER'].includes(role)) {
    return res.status(400).json({ error: 'Role must be CANDIDATE or RECRUITER' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        firstName: firstName || '',
        lastName:  lastName  || '',
      },
    });

    const token = makeToken(user);
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.post('/login-password', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err)   return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Invalid email or password' });

    const token = makeToken(user);
    res.json({ token, user });
  })(req, res, next);
});



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
}, passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google_failed` }),
  (req, res) => {
    const token = makeToken(req.user);
    res.redirect(`${FRONTEND_URL}/login?token=${token}`);
  }
);



router.get('/facebook', (req, res, next) => {
  if (!isFacebookAuthEnabled) {
    return res.status(501).json({ error: 'Facebook OAuth is not configured' });
  }
  next();
}, passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback', (req, res, next) => {
  if (!isFacebookAuthEnabled) {
    return res.status(501).json({ error: 'Facebook OAuth is not configured' });
  }
  next();
}, passport.authenticate('facebook', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=facebook_failed` }),
  (req, res) => {
    const token = makeToken(req.user);
    res.redirect(`${FRONTEND_URL}/login?token=${token}`);
  }
);


router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user    = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});



router.post('/dev-login', async (req, res) => {
  const { role, email } = req.body;
  if (!role || !['CANDIDATE', 'RECRUITER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Invalid or missing role' });
  }

  const defaultEmail = email || `demo-${role.toLowerCase()}@example.com`;

  try {
    let user = await prisma.user.findUnique({ where: { email: defaultEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: defaultEmail,
          role,
          firstName: 'Demo',
          lastName:  role.charAt(0) + role.slice(1).toLowerCase(),
          location:  'Almaty, Kazakhstan',
          photoUrl:  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        },
      });
    } else if (user.role !== role) {
      user = await prisma.user.update({ where: { id: user.id }, data: { role } });
    }

    const token = makeToken(user);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.post('/login', async (req, res) => {
  const { email, role = 'CANDIDATE', firstName, lastName } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  if (!['CANDIDATE', 'RECRUITER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          role,
          firstName: firstName || 'Demo',
          lastName:  lastName  || 'User',
          photoUrl:  'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=150&h=150&fit=crop&crop=face',
        },
      });
    }

    const token = makeToken(user);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
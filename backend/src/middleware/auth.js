const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret';

exports.authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }

      try {
        const { prisma } = require('../db');
        const user = await prisma.user.findUnique({
          where: { id: decoded.id }
        });
        
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }

        if (user.blocked) {
          return res.status(403).json({ error: 'User is blocked' });
        }

        req.user = user;
        next();
      } catch (dbErr) {
        return res.sendStatus(500);
      }
    });
  } else {
    res.sendStatus(401);
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
    }
    next();
  };
};

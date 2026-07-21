const passport = require('passport');
const bcrypt = require('bcrypt');
const { prisma } = require('./db');


const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const isGoogleAuthEnabled  = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

if (isGoogleAuthEnabled) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  passport.use('google', new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email    = profile.emails?.[0]?.value;
        const photoUrl = profile.photos?.[0]?.value || null;
        if (!email) return done(new Error('Google account has no email'), null);

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              firstName: profile.name?.givenName || '',
              lastName:  profile.name?.familyName || '',
              photoUrl,
              googleId: profile.id,
              role: 'CANDIDATE',
            },
          });
        } else if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data:  { googleId: profile.id },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));
} else {
  console.warn('Google OAuth disabled: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set.');
}


const FACEBOOK_APP_ID     = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const isFacebookAuthEnabled = Boolean(FACEBOOK_APP_ID && FACEBOOK_APP_SECRET);

if (isFacebookAuthEnabled) {
  const FacebookStrategy = require('passport-facebook').Strategy;
  passport.use('facebook', new FacebookStrategy(
    {
      clientID:     FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL:  '/api/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'photos'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email    = profile.emails?.[0]?.value;
        const photoUrl = profile.photos?.[0]?.value || null;

        if (!email) {
          return done(new Error('Facebook account did not provide an email address'), null);
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              firstName: profile.name?.givenName || '',
              lastName:  profile.name?.familyName || '',
              photoUrl,
              facebookId: profile.id,
              role: 'CANDIDATE',
            },
          });
        } else if (!user.facebookId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data:  { facebookId: profile.id },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  ));
} else {
  console.warn('Facebook OAuth disabled: FACEBOOK_APP_ID / FACEBOOK_APP_SECRET not set.');
}


const LocalStrategy = require('passport-local').Strategy;
passport.use('local', new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));


passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = {
  passport,
  isGoogleAuthEnabled,
  isFacebookAuthEnabled,
};
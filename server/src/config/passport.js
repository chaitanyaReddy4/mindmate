const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const User = require("../models/User");

const configurePassport = ({
  googleClientId,
  googleClientSecret,
  googleCallbackUrl
}) => {
  if (!googleClientId || !googleClientSecret) {
    return passport;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const primaryEmail = profile.emails?.[0]?.value?.toLowerCase();
          let user = null;

          if (profile.id) {
            user = await User.findOne({ googleId: profile.id });
          }

          if (!user && primaryEmail) {
            user = await User.findOne({ email: primaryEmail });
          }

          if (!user) {
            user = await User.create({
              name:
                profile.displayName ||
                primaryEmail?.split("@")[0] ||
                "MindMate User",
              email: primaryEmail,
              googleId: profile.id
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            if (!user.name && profile.displayName) {
              user.name = profile.displayName;
            }
            await user.save();
          }

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  return passport;
};

module.exports = configurePassport;

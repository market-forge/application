import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "./models/User.js";
import 'dotenv/config';

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/auth/github/callback",
    },
    function(accessToken, refreshToken, profile, done) {
      let user = User.findByEmail(profile.username + "@github.com");
      if (!user) {
        user = User.create({ username: profile.username, email: profile.username + "@github.com" });
      }
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = User.findById(id);
  done(null, user);
});

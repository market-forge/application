import express from "express";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

dotenv.config();
const router = express.Router();

const client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Step 1: Generate Google login URL
router.get("/url", (req, res) => {
  const authorizeUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "consent"
  });
  res.json({ url: authorizeUrl });
});

// Step 2: Handle callback from Google (with ?code=)
router.get("/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user profile
    const userInfoRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokens.access_token}`
    );
    const userInfo = await userInfoRes.json();

    // Upsert user in DB
    let user = await User.findOne({ googleId: userInfo.sub });
    if (!user) {
      user = await User.create({
        googleId: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture
      });
    }

    // Sign JWT for your app
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send token + user back (in real app: redirect to frontend with token)
    res.json({ user, token });

  } catch (err) {
    console.error("OAuth error:", err);
    res.status(500).json({ error: "OAuth failed" });
  }
});

export default router;

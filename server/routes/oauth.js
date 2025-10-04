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
    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user profile from Google
    const userInfoRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokens.access_token}`
    );
    const userInfo = await userInfoRes.json();
    // console.log("Google user info:", userInfo);

    // insert user in DB if doesn't exist
    let user;
    try {
      // Check if user exists by email
      user = await User.findOne({ email: userInfo.email });
      if (!user) {
        // Create new user if doesn't exist
        user = await User.create({
          name: userInfo.name,
          email: userInfo.email,
          age: 18 // default age since Google doesn’t provide it
        });
      } else {
        console.log("User already exists:", user.email);
      }
    } catch (dbErr) {
      console.error("Database Connection error:");
      return res.status(500).json({ error: "Database error" });
    }

    // Sign JWT for your app
    const token = jwt.sign(
      { id: user._id, email: user.email, age: user.age },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send token + user back (in real app: redirect to frontend with token)
    // res.json({ user, token });
    // 🔑 Redirect to React frontend
    res.redirect(`http://localhost:3000?token=${token}`);

  } catch (err) {
    console.error("OAuth error:", err);
    res.status(500).json({ error: "OAuth failed" });
  }
});

export default router;

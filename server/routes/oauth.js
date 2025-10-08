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
      `${process.env.GOOGLE_OAUTH_URL}=${tokens.access_token}`
    );
    const userInfo = await userInfoRes.json();

    // Insert or update user in DB
    let user;
    try {
      // Check if user exists by email
      user = await User.findOne({ email: userInfo.email });
      if (!user) {
        // Create new user with enhanced profile data
        user = await User.create({
          name: userInfo.name,
          email: userInfo.email,
          given_name: userInfo.given_name,
          family_name: userInfo.family_name,
          picture: userInfo.picture,
          locale: userInfo.locale,
          last_login: new Date(),
          // Set age from legacy field if needed
          age: 18 // default age since Google doesn't provide it
        });
      } else {
        // Update existing user with latest Google info and last login
        user = await User.findByIdAndUpdate(user._id, {
          name: userInfo.name,
          given_name: userInfo.given_name,
          family_name: userInfo.family_name,
          picture: userInfo.picture,
          locale: userInfo.locale,
          last_login: new Date()
        }, { new: true });
      }
    } catch (dbErr) {
      console.error("Database Connection error:", dbErr);
      return res.status(500).json({ "Database Connection error": "No Connection"});
    }

    // Create JWT with enhanced user data
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        name: userInfo.given_name || userInfo.name,
        full_name: userInfo.name,
        family_name: userInfo.family_name,
        picture: userInfo.picture
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Redirect to frontend with JWT
    res.redirect(`${process.env.CLIENT_URL}?token=${token}`);

  } catch (err) {
    console.error("OAuth error:", err);
    res.status(500).json({ error: "OAuth failed" });
  }
});

export default router;

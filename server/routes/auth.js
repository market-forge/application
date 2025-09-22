import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import 'dotenv/config';

const router = express.Router();

/* --- Register --- */
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: "Missing fields" });

  if (User.findByEmail(email)) return res.status(400).json({ message: "User exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = User.create({ username, email, password: hashedPassword });
  res.status(201).json({ message: "Registered successfully", user: { id: user.id, username, email } });
});

/* --- Login --- */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = User.findByEmail(email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

/* --- GitHub OAuth --- */
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login/failed" }),
  (req, res) => {
    // Redirect to frontend with user info
    const user = req.user;
    res.redirect(`${process.env.CLIENT_URL}?user=${JSON.stringify(user)}`);
  }
);

/* --- Logout --- */
router.get("/logout", (req, res) => {
  req.logout(() => {});
  res.redirect(process.env.CLIENT_URL);
});

export default router;

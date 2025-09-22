import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/error.js';
import routes from "./routes/index.js";
import passport from "passport";
import authRoutes from "./routes/auth.js";
import './passport.js';
import session from "express-session";
import 'dotenv/config';


// import dotenv from 'dotenv';
// dotenv.config();

// const port = process.env.PORT || 8000;
const PORT = process.env.PORT || 8080;

const mongoUri = process.env.MONGO_URI || "";

const app = express();

// Basic middlewares
// app.use(cors());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', routes);
app.use("/auth", authRoutes);

// NotFound Error Handler
app.use(notFound);

// Error Handler middleware goes here
app.use(errorHandler);

// MongoDB connection
// mongoose.connect(mongoUri)
// .then(() => console.log("Connected to MongoDB"))
// .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
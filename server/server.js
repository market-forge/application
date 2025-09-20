import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/error.js';
import routes from "./routes/index.js";

import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 8000;
const mongoUri = process.env.MONGO_URI || "";

const app = express();

// Basic middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

// NotFound Error Handler
app.use(notFound);

// Error Handler middleware goes here
app.use(errorHandler);

// MongoDB connection
mongoose.connect(mongoUri)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error:", err));

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
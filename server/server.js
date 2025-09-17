import express from 'express';
import cors from 'cors';
import helloWorld from './routes/helloWorld.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/error.js';
import routes from "./routes/index.js";

const port = process.env.PORT || 8000;

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

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
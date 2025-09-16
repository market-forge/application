import express from 'express';
import helloWorld from './routes/helloWorld.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/error.js';

const port = process.env.PORT || 8000;

const app = express();

// Middleware goes here

// Routes
app.use('/helloworld', helloWorld);

// NotFound Error Handler
app.use(notFound);

// Error Handler middleware goes here
app.use(errorHandler);

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
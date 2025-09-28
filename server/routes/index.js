import express from 'express';
import helloWorld from './helloWorld.js';
import userRoutes from './userRoutes.js';
import articlesRoutes from './articleRoutes.js';
import summaryRoutes from './summaryRoutes.js';

const router = express.Router();

// Mount all routes here
router.use('/helloworld', helloWorld);
router.use('/users', userRoutes);
router.use('/articles', articlesRoutes);
router.use('/summaries', summaryRoutes);

export default router;
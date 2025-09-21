import express from 'express';
import helloWorld from './helloWorld.js';
import userRoutes from './userRoutes.js';

const router = express.Router();

// Mount all routes here
router.use('/helloworld', helloWorld);
router.use('/users', userRoutes);

export default router;
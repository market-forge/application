import express from 'express';
import helloWorld from './helloWorld.js';

const router = express.Router();

// Mount all routes here
router.use('/helloworld', helloWorld);

export default router;
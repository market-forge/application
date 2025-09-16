import express from 'express';
import { helloWorld } from '../controllers/helloWorldController.js';

const router = express.Router();

// Get 'Hello World' message
router.get('/', helloWorld);

export default router;
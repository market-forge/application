import express from 'express';
import helloWorld from './helloWorld.js';
import userRoutes from './userRoutes.js';
import articlesRoutes from './articleRoutes.js';
import summaryRoutes from './summaryRoutes.js';
import oauthRoutes from "./oauth.js";
import profileRoutes from "./profileRoutes.js";

const router = express.Router();

// Mount all routes here
router.use('/helloworld', helloWorld);
router.use('/users', userRoutes);
router.use('/articles', articlesRoutes);
router.use('/summaries', summaryRoutes);
router.use("/oauth", oauthRoutes);
router.use("/profile", profileRoutes);

export default router;
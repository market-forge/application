import express from 'express';
import userRoutes from './userRoutes.js';
import articlesRoutes from './articleRoutes.js';
import summaryRoutes from './summaryRoutes.js';
import oauthRoutes from "./oauth.js";
import profileRoutes from "./profileRoutes.js";
import proxyRoute from "./proxy.js";
import favoritesRoutes from "./favoritesRoutes.js";

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the API — connection successful!',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

router.use('/users', userRoutes);
router.use('/articles', articlesRoutes);
router.use('/summaries', summaryRoutes);
router.use("/oauth", oauthRoutes);
router.use("/profile", profileRoutes);
router.use("/proxy", proxyRoute);
router.use("/favorites", favoritesRoutes);

export default router;

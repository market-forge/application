const cronSummaries = (req, res, next) => {
    // Check if request is from internal system
    const internalToken = req.headers['x-internal-token'];
    const expectedToken = process.env.CRON_SECRET;

    if (!internalToken || internalToken !== expectedToken) {
        return res.status(403).json({error: "Forbidden: Internal access only"});
    }
    next();
};

export default cronSummaries;
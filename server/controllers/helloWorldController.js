// @desc Get Hello World message
// @route GET /helloworld
export const helloWorld = (req, res, next) => {
    res.status(200).json({ msg: 'Hello World!' });
}
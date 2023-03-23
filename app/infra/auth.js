const jwt = require('jsonwebtoken')
    , { promisify } = require('util');

const verify = promisify(jwt.verify);

module.exports = async (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (token) {
        try {
            const decoded = await verify(token, req.app.get('secret'));
            req.user = decoded;
            next();
        } catch (err) {
            return res.sendStatus(401);
        }
    } else {
        return res.sendStatus(401);
    }
}
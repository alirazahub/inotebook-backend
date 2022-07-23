const jwt = require('jsonwebtoken');
const JWT_SECRET = 'thisisscretjwtkeyofINOTEBOOK';
const fetchuser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
}
module.exports = fetchuser;
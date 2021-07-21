const jwt = require('jsonwebtoken')
require('dotenv').config()
const { body, validationResult } = require('express-validator');

const verifyToken = (req, res, next) => {
    if(!req.headers.authorization) return res.status(400).send('Auth Header Bearer Token Is Required')

    var authHeaders = req.headers.authorization.split(" ")
    if(authHeaders[0] != 'Bearer') return res.status(400).send('Token Must Be Bearer Token')

    try {
        jwt.verify(authHeaders[1], process.env.SECRET_KEY);
    } catch (err) {
        return res.status(400).send(err)
    }
    
    next()
}

const validationHandler = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    next()
}

module.exports = {
    verifyToken,
    validationHandler
}
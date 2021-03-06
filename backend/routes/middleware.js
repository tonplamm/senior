const jwt = require('jsonwebtoken');
const secret = 'thisiskanokpol';

const withAuth = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token
  if (!token) {
    req.token_username = req.token_firstname = req.token_lastname = req.token_status = ""
    next()
  } else {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        req.token_username = req.token_firstname = req.token_lastname = req.token_status = ""
        next()
      } else {
        req.token_username = decoded.username
        req.token_firstname = decoded.firstname
        req.token_lastname = decoded.lastname
        req.token_status = decoded.status
        next()
      }
    })
  }
}

module.exports = withAuth
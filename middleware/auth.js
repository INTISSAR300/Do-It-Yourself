const jwt = require('jsonwebtoken');

module.exports = function isAuthenticated(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  jwt.verify(token, "CMC2024", (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Token invalide', error: err });
    } else {
      req.user = user;
      console.log("✅ Utilisateur authentifié:", user);
      next();
    }
  });
};

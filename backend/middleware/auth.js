const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "defaultsecretkey123"
    );
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is invalid or expired" });
  }
};
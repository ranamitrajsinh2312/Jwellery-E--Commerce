const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes (require login)
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      console.log('Verifying token:', token);
      
      // Use JWT_SECRET consistently for all token verification
      const jwtSecret = process.env.JWT_SECRET;
      console.log('Using JWT secret:', jwtSecret);
      
      const decoded = jwt.verify(token, jwtSecret);
      
      console.log('Token decoded:', decoded);

      // Attach user info
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.log('User not found in database');
        return res.status(401).json({ message: "User not found" });
      }

      console.log('User authenticated:', req.user._id);
      next();
    } catch (error) {
      console.error("Auth Error:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

module.exports = { protect, admin };

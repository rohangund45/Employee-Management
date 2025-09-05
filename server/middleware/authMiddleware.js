import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; // ✅ fixed lowercase
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: "Token not Provided" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ success: false, error: "Invalid Token" });
    }

    const user = await User.findById(decoded._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: "User not Found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export default verifyUser;

const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // 檢查 Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未授權訪問'
      });
    }

    try {
      // 驗證 token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 檢查用戶是否存在
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '找不到該用戶'
        });
      }

      // 將用戶信息添加到請求對象中
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Token 無效'
      });
    }
  } catch (error) {
    next(error);
  }
};

// 檢查用戶角色
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '無權限執行此操作'
      });
    }
    next();
  };
}; 
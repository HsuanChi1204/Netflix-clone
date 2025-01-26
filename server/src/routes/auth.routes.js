const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth');

// 註冊路由
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('姓名為必填項'),
    body('email').isEmail().withMessage('請提供有效的電子郵件'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('密碼至少需要6個字符')
  ],
  register
);

// 登錄路由
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('請提供有效的電子郵件'),
    body('password').exists().withMessage('請提供密碼')
  ],
  login
);

// 獲取當前用戶信息路由
router.get('/me', protect, getMe);

module.exports = router; 
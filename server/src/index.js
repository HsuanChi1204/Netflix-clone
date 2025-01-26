const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const favoritesRoutes = require('./routes/favorites.routes');
const commentsRoutes = require('./routes/comments.routes');

// 加載環境變量
dotenv.config();

// 初始化 Express 應用
const app = express();

// 連接數據庫
connectDB();

// 中間件
app.use(cors());  // 允許跨域請求
app.use(helmet());  // 增加安全性標頭
app.use(express.json());  // 解析 JSON 請求體
app.use(express.urlencoded({ extended: true }));  // 解析 URL 編碼的請求體

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/comments', commentsRoutes);

// 基本路由
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Netflix Clone API' });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: err.message || 'Something went wrong!' 
  });
});

// 啟動服務器
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
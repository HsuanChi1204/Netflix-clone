const dotenv = require('dotenv');
// 加載環境變量（必須在其他 require 之前）
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const favoritesRoutes = require('./routes/favorites.routes');
const commentsRoutes = require('./routes/comments.routes');

// 初始化 Express 應用
const app = express();

// 連接數據庫
connectDB();

// CORS 配置
const allowedOrigins = [
  'https://netflix-clone-production.vercel.app',
  'https://netflix-clone-client.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

// 如果是開發環境，允許所有來源
const corsOptions = {
  origin: function (origin, callback) {
    // 允許沒有來源的請求（如移動應用或 curl）
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked request from:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// 中間件
app.use(cors(corsOptions));  // 使用配置的 CORS 選項
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
  console.log('Environment:', process.env.NODE_ENV);
  console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
}); 
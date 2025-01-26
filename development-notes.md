# Netflix Clone 開發筆記 - MongoDB 整合後的功能開發

###### tags: `React` `Node.js` `MongoDB` `Express`

## 今日完成功能

### 1. 數據模型設計
#### User Model
```javascript
// 用戶數據模型
const userSchema = {
  name: String,         // 用戶名稱
  email: String,        // 電子郵件（唯一）
  password: String,     // 加密後的密碼
  createdAt: Date      // 創建時間
}
```

#### Favorite Model
```javascript
// 收藏數據模型
const favoriteSchema = {
  userId: ObjectId,     // 用戶ID
  movieId: String,      // 電影ID
  title: String,        // 電影標題
  posterPath: String    // 電影海報路徑
}
```

### 2. API 路由實現
#### 認證路由
```javascript
// 用戶認證相關 API
POST /api/auth/register   // 用戶註冊
POST /api/auth/login      // 用戶登入
GET /api/auth/profile     // 獲取用戶資料
```

#### 收藏路由
```javascript
// 收藏功能相關 API
GET /api/favorites          // 獲取收藏列表
POST /api/favorites         // 添加收藏
DELETE /api/favorites/:id   // 移除收藏
GET /api/favorites/check/:movieId  // 檢查收藏狀態
```

### 3. 安全性實現
#### JWT 認證
```javascript
// JWT 中間件
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: '請先登入' });
  }
  // 驗證 token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '登入已過期' });
  }
};
```

#### 錯誤處理
```javascript
// 統一錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || '服務器錯誤'
  });
});
```

### 4. 用戶界面組件
#### TitleCards 組件優化
- 添加電影詳情模態框
- 實現預告片播放功能
- 整合收藏和評論功能
```javascript
const TitleCards = () => {
  // 狀態管理
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [comments, setComments] = useState([]);
  
  // 處理電影詳情
  const handleInfoClick = async (movie) => {
    setSelectedMovie(movie);
    await fetchTrailer(movie.id);
    await fetchComments(movie.id);
  };
  // ...
};
```

### 5. 狀態管理實現
#### 用戶認證狀態
```javascript
// 使用 localStorage 存儲用戶信息
const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
const [token, setToken] = useState(localStorage.getItem('token'));

// 登入後保存狀態
const handleLogin = (userData, token) => {
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('token', token);
  setUser(userData);
  setToken(token);
};
```

#### 收藏狀態管理
```javascript
// 收藏狀態管理
const [favorites, setFavorites] = useState({});

// 檢查收藏狀態
const checkFavoriteStatus = async (movieId) => {
  try {
    const response = await axios.get(`/api/favorites/check/${movieId}`);
    setFavorites(prev => ({
      ...prev,
      [movieId]: response.data.isFavorite
    }));
  } catch (error) {
    handleError(error);
  }
};
```

### 6. 評論功能
#### 功能說明
- 用戶可以為電影評分（1-5星）
- 可以發表文字評論
- 顯示所有用戶的評論列表

#### 實作過程
1. 後端設置
```javascript
// 評論數據模型
const commentSchema = {
  movieId: String,    // 電影ID
  userId: ObjectId,   // 用戶ID
  content: String,    // 評論內容
  rating: Number,     // 評分 (1-5)
  username: String    // 評論者名稱
}
```

2. API 端點
```javascript
POST /api/comments - 發布評論
GET /api/comments/:movieId - 獲取電影評論
```

3. 前端實現
- 在電影詳情模態框中添加評論區
- 實現星級評分系統
- 添加評論表單
- 展示評論列表

#### 注意事項
- 檢查用戶是否已評論過該電影
- 評論內容不能為空
- 必須選擇評分才能發布
- 評論區域使用滾動條展示

### 7. Navbar 下拉選單優化
#### 問題描述
用戶頭像的下拉選單無法點擊，因為移動到選單時會消失

#### 解決方案
添加過渡區域確保選單可以點擊：
```css
.navbar-profile {
  padding-bottom: 20px;    // 創建過渡區域
  margin-bottom: -20px;    // 補償位移
}

.dropdown::before {
  content: '';
  height: 20px;           // 透明過渡區
  position: absolute;
  top: -20px;
}
```

#### 重點說明
- 使用 padding 和 margin 來創建不可見的過渡區域
- 保持視覺效果不變的同時提升可用性
- 確保下拉選單的 z-index 正確

### 8. 評論區域樣式優化
#### 實現目標
- 固定高度的評論區域
- 美觀的滾動條
- 清晰的評論卡片樣式

#### 具體實現
```css
.modal-comments {
  max-height: 400px;      // 固定高度
  overflow-y: auto;       // 允許滾動
  padding-right: 1rem;    // 留出滾動條空間
}

.comment-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}
```

## 開發重點提醒
1. 用戶體驗
   - 統一的錯誤處理機制
   - 載入狀態顯示
   - 友好的用戶提示

2. 性能優化
   - API 響應緩存
   - 圖片懶加載
   - 組件按需渲染

3. 安全性
   - 請求攔截器統一處理認證
   - 表單數據驗證
   - XSS 防護

## 待優化項目
1. 功能擴展
   - 用戶個人頁面
   - 社交功能整合
   - 更多互動功能

2. 性能提升
   - 實現無限滾動
   - 添加數據預加載
   - 優化大量數據渲染

3. 用戶體驗
   - 添加更多動畫效果
   - 優化移動端體驗
   - 提供多語言支持

---
最後更新時間: ${new Date().toLocaleString()} 
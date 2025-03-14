const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const { protect } = require('../middlewares/auth');

// 獲取用戶的收藏清單
router.get('/', protect, async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.user.id })
            .sort({ createdAt: -1 }); // 最新收藏的排在前面
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ message: '獲取收藏清單失敗' });
    }
});

// 新增收藏
router.post('/', protect, async (req, res) => {
    try {
        const { movieId, title, posterPath, mediaType } = req.body;
        
        // 檢查是否已經收藏
        const existing = await Favorite.findOne({
            userId: req.user.id,
            movieId
        });

        if (existing) {
            return res.status(400).json({ message: '已經收藏過這部影片' });
        }

        const favorite = new Favorite({
            userId: req.user.id,
            movieId,
            title,
            posterPath,
            mediaType
        });

        await favorite.save();
        res.status(201).json(favorite);
    } catch (error) {
        res.status(500).json({ message: '新增收藏失敗' });
    }
});

// 移除收藏
router.delete('/:movieId', protect, async (req, res) => {
    try {
        const result = await Favorite.findOneAndDelete({
            userId: req.user.id,
            movieId: req.params.movieId
        });

        if (!result) {
            return res.status(404).json({ message: '找不到該收藏記錄' });
        }

        res.json({ message: '已成功移除收藏' });
    } catch (error) {
        res.status(500).json({ message: '移除收藏失敗' });
    }
});

// 檢查影片是否已收藏
router.get('/check/:movieId', protect, async (req, res) => {
    try {
        const favorite = await Favorite.findOne({
            userId: req.user.id,
            movieId: req.params.movieId
        });

        res.json({ isFavorite: !!favorite });
    } catch (error) {
        res.status(500).json({ message: '檢查收藏狀態失敗' });
    }
});

module.exports = router; 
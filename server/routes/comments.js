const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// 獲取特定電影的所有評論
router.get('/:movieId', async (req, res) => {
  try {
    const comments = await Comment.find({ movieId: req.params.movieId })
      .sort({ createdAt: -1 }); // 按時間降序排序
    res.json(comments);
  } catch (error) {
    console.error('獲取評論失敗:', error);
    res.status(500).json({ message: '獲取評論失敗' });
  }
});

// 新增評論
router.post('/', auth, async (req, res) => {
  try {
    const { movieId, content, rating } = req.body;

    // 檢查是否已經評論過
    const existingComment = await Comment.findOne({
      movieId,
      userId: req.user.id
    });

    if (existingComment) {
      return res.status(400).json({ message: '您已經評論過這部電影了' });
    }

    const newComment = new Comment({
      movieId,
      userId: req.user.id,
      username: req.user.username,
      content,
      rating
    });

    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    console.error('新增評論失敗:', error);
    res.status(500).json({ message: '新增評論失敗' });
  }
});

// 修改評論
router.put('/:commentId', auth, async (req, res) => {
  try {
    const { content, rating } = req.body;
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: '評論不存在' });
    }

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: '無權修改此評論' });
    }

    comment.content = content;
    comment.rating = rating;
    const updatedComment = await comment.save();

    res.json(updatedComment);
  } catch (error) {
    console.error('修改評論失敗:', error);
    res.status(500).json({ message: '修改評論失敗' });
  }
});

// 刪除評論
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: '評論不存在' });
    }

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: '無權刪除此評論' });
    }

    await comment.deleteOne();
    res.json({ message: '評論已刪除' });
  } catch (error) {
    console.error('刪除評論失敗:', error);
    res.status(500).json({ message: '刪除評論失敗' });
  }
});

module.exports = router; 
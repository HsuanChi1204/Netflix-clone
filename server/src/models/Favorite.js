const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movieId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    posterPath: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        enum: ['movie', 'tv'],
        required: true
    }
}, { 
    timestamps: true,
    // 確保同一用戶不會重複收藏同一部電影
    indexes: [
        { unique: true, fields: ['userId', 'movieId'] }
    ]
});

module.exports = mongoose.model('Favorite', favoriteSchema); 
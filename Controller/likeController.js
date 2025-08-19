const pool = require('../db');

class LikeController {
    // Добавление/удаление лайка
    async toggleLike(req, res) {
        const { postId } = req.body;
        const userId = req.user.userId;

        try {
            // Проверяем, есть ли уже лайк от этого пользователя
            const existingLike = await pool.query(
                'SELECT * FROM likes WHERE user_id = $1 AND post_id = $2',
                [userId, postId]
            );

            if (existingLike.rows.length > 0) {
                // Удаляем лайк
                await pool.query(
                    'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
                    [userId, postId]
                );
                return res.json({
                    status: 'success',
                    message: 'Like removed',
                    liked: false
                });
            } else {
                // Добавляем лайк
                await pool.query(
                    'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
                    [userId, postId]
                );
                return res.json({
                    status: 'success',
                    message: 'Like added',
                    liked: true
                });
            }
        } catch (error) {
            console.error('Toggle like error:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Internal server error'
            });
        }
    }

    // Получение количества лайков для поста
    async getLikesCount(req, res) {
        const { postId } = req.params;

        try {
            const result = await pool.query(
                'SELECT COUNT(*) FROM likes WHERE post_id = $1',
                [postId]
            );

            res.json({
                status: 'success',
                likesCount: parseInt(result.rows[0].count)
            });
        } catch (error) {
            console.error('Get likes count error:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Internal server error'
            });
        }
    }

    // Проверка, лайкнул ли текущий пользователь пост
    async checkUserLike(req, res) {
        const { postId } = req.params;
        const userId = req.user.userId;

        try {
            const result = await pool.query(
                'SELECT * FROM likes WHERE user_id = $1 AND post_id = $2',
                [userId, postId]
            );

            res.json({
                status: 'success',
                liked: result.rows.length > 0
            });
        } catch (error) {
            console.error('Check user like error:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new LikeController();
const pool = require('../db');

class CommentController {
    // Создание комментария
    async createComment(req, res) {
        const { postId, content } = req.body;
        const userId = req.user.userId;

        try {
            const newComment = await pool.query(
                'INSERT INTO comments (content, user_id, post_id) VALUES ($1, $2, $3) RETURNING *',
                [content, userId, postId]
            );

            res.status(201).json({
                status: 'success',
                comment: newComment.rows[0]
            });
        } catch (error) {
            console.error('Create comment error:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Internal server error'
            });
        }
    }

    // Получение комментариев для поста
    async getCommentsByPost(req, res) {
        const { postId } = req.params;

        try {
            const comments = await pool.query(`
                SELECT c.*, u.username 
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.post_id = $1
                ORDER BY c.created_at DESC
            `, [postId]);

            res.json({
                status: 'success',
                results: comments.rows.length,
                comments: comments.rows
            });
        } catch (error) {
            console.error('Get comments error:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Internal server error'
            });
        }
    }

    // Удаление комментария
    async deleteComment(req, res) {
        const { id } = req.params;
        const userId = req.user.userId;

        try {
            // Проверяем, что комментарий принадлежит пользователю
            const comment = await pool.query('SELECT * FROM comments WHERE id = $1 AND user_id = $2', [id, userId]);
            
            if (comment.rows.length === 0) {
                return res.status(403).json({ 
                    status: 'error',
                    message: 'You can only delete your own comments'
                });
            }

            await pool.query('DELETE FROM comments WHERE id = $1', [id]);

            res.json({
                status: 'success',
                message: 'Comment deleted successfully'
            });
        } catch (error) {
            console.error('Delete comment error:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new CommentController();
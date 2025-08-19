const pool = require('../db');

class PostController {
    // Создание поста
    async createPost(req, res) {
        const { title, content } = req.body;
        const userId = req.user.userId;

        try {
            const newPost = await pool.query(
                'INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
                [title, content, userId]
            );

            res.status(201).json({
                status: 'success',
                post: newPost.rows[0]
            });
        } catch (error) {
            console.error('Create post error:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Internal server error'
            });
        }
    }

    // Добавление изображения к посту
    async addImageToPost(req, res) {
        const { postId } = req.body;
        const userId = req.user.userId;
        
        if (!req.imageData) {
            return res.status(400).json({ 
                status: 'error',
                message: 'No image provided' 
            });
        }

        try {
            // Проверяем, что пост принадлежит пользователю
            const post = await pool.query('SELECT * FROM posts WHERE id = $1 AND user_id = $2', [postId, userId]);
            
            if (post.rows.length === 0) {
                // Удаляем загруженные файлы
                if (req.imageData.original) {
                    fs.unlinkSync(path.join(__dirname, '../', req.imageData.original));
                }
                if (req.imageData.thumbnail) {
                    fs.unlinkSync(path.join(__dirname, '../', req.imageData.thumbnail));
                }
                
                return res.status(403).json({ 
                    status: 'error',
                    message: 'You can only add images to your own posts'
                });
            }

            const newImage = await pool.query(
                'INSERT INTO post_images (post_id, image_url, thumbnail_url) VALUES ($1, $2, $3) RETURNING *',
                [postId, req.imageData.original, req.imageData.thumbnail]
            );

            res.status(201).json({
                status: 'success',
                image: newImage.rows[0]
            });
        } catch (error) {
            console.error('Add image error:', error);
            // Удаляем загруженные файлы в случае ошибки
            if (req.imageData.original) {
                fs.unlinkSync(path.join(__dirname, '../', req.imageData.original));
            }
            if (req.imageData.thumbnail) {
                fs.unlinkSync(path.join(__dirname, '../', req.imageData.thumbnail));
            }
            res.status(500).json({ 
                status: 'error',
                message: 'Internal server error'
            });
        }
    }

    // Получение изображений для поста
    async getPostImages(req, res) {
        const { postId } = req.params;

        try {
            const images = await pool.query(
                'SELECT * FROM post_images WHERE post_id = $1 ORDER BY created_at',
                [postId]
            );

            res.json({
                status: 'success',
                images: images.rows
            });
        } catch (error) {
            console.error('Get post images error:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Internal server error'
            });
        }
    }

    // Получение всех постов
    async getAllPosts(req, res) {
        try {
            const posts = await pool.query(`
                SELECT p.*, u.username 
                FROM posts p
                JOIN users u ON p.user_id = u.id
                ORDER BY p.created_at DESC
            `);

            res.json({
                status: 'success',
                results: posts.rows.length,
                posts: posts.rows
            });
        } catch (error) {
            console.error('Get posts error:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Internal server error'
            });
        }
    }

    // Получение поста по ID
    async getPostById(req, res) {
        const { id } = req.params;

        try {
            const post = await pool.query(`
                SELECT p.*, u.username 
                FROM posts p
                JOIN users u ON p.user_id = u.id
                WHERE p.id = $1
            `, [id]);

            if (post.rows.length === 0) {
                return res.status(404).json({ 
                    status: 'error',
                    message: 'Post not found'
                });
            }

            res.json({
                status: 'success',
                post: post.rows[0]
            });
        } catch (error) {
            console.error('Get post error:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Internal server error'
            });
        }
    }

    // Обновление поста
    async updatePost(req, res) {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user.userId;

        try {
            // Проверяем, что пост принадлежит пользователю
            const post = await pool.query('SELECT * FROM posts WHERE id = $1 AND user_id = $2', [id, userId]);
            
            if (post.rows.length === 0) {
                return res.status(403).json({ 
                    status: 'error',
                    message: 'You can only update your own posts'
                });
            }

            const updatedPost = await pool.query(
                'UPDATE posts SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
                [title, content, id]
            );

            res.json({
                status: 'success',
                post: updatedPost.rows[0]
            });
        } catch (error) {
            console.error('Update post error:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Internal server error'
            });
        }
    }

    // Удаление поста
    async deletePost(req, res) {
        const { id } = req.params;
        const userId = req.user.userId;

        try {
            // Проверяем, что пост принадлежит пользователю
            const post = await pool.query('SELECT * FROM posts WHERE id = $1 AND user_id = $2', [id, userId]);
            
            if (post.rows.length === 0) {
                return res.status(403).json({ 
                    status: 'error',
                    message: 'You can only delete your own posts'
                });
            }

            await pool.query('DELETE FROM posts WHERE id = $1', [id]);

            res.json({
                status: 'success',
                message: 'Post deleted successfully'
            });
        } catch (error) {
            console.error('Delete post error:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new PostController();
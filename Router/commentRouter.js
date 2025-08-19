const express = require('express');
const router = express.Router();
const commentController = require('../Controller/commentController');
const authMiddleware = require('../middleware/authMiddleware');

// Получение комментариев для поста (доступно без авторизации)
router.get('/post/:postId', commentController.getCommentsByPost);

// Все остальные операции требуют авторизации
router.use(authMiddleware);

// Создание комментария
router.post('/', commentController.createComment);

// Удаление комментария
router.delete('/:id', commentController.deleteComment);

module.exports = router;
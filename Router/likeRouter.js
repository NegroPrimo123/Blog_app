const express = require('express');
const router = express.Router();
const likeController = require('../Controller/likeController');
const authMiddleware = require('../middleware/authMiddleware');

// Получение количества лайков для поста (доступно без авторизации)
router.get('/count/:postId', likeController.getLikesCount);

// Все остальные операции требуют авторизации
router.use(authMiddleware);

// Переключение лайка
router.post('/toggle', likeController.toggleLike);

// Проверка, лайкнул ли текущий пользователь пост
router.get('/check/:postId', likeController.checkUserLike);

module.exports = router;
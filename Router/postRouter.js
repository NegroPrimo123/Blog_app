const express = require('express');
const router = express.Router();
const postController = require('../Controller/postController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadImage = require('../middleware/uploadMiddleware');

// Получение всех постов (доступно без авторизации)
router.get('/', postController.getAllPosts);

// Получение конкретного поста (доступно без авторизации)
router.get('/:id', postController.getPostById);

// Получение изображений поста (доступно без авторизации)
router.get('/:postId/images', postController.getPostImages);

// Все остальные операции требуют авторизации
router.use(authMiddleware);

// Создание поста
router.post('/', postController.createPost);

// Обновление поста
router.put('/:id', postController.updatePost);

// Удаление поста
router.delete('/:id', postController.deletePost);

// Добавление изображения к посту
router.post('/images', uploadImage, postController.addImageToPost);

module.exports = router;
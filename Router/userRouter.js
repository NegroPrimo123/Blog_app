const express = require('express');
const router = express.Router();
const userController = require('../Controller/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Регистрация
router.post('/register', userController.register);

// Авторизация
router.post('/login', userController.login);

// Получение информации о текущем пользователе
router.get('/me', authMiddleware, userController.getMe);

module.exports = router
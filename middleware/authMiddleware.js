const jwt = require('jsonwebtoken');
const pool = require('../db');

module.exports = async (req, res, next) => {
    try {
        // Получаем токен из заголовка
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Проверяем токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Проверяем, что пользователь существует
        const user = await pool.query('SELECT id FROM users WHERE id = $1', [decoded.userId]);
        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Добавляем пользователя в запрос
        req.user = decoded;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};
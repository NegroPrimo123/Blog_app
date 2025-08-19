require('dotenv').config();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class UserController {
    
    async register(req, res) {
    const { username, password, email } = req.body;
    
    try {
        // Проверяем, существует ли пользователь с таким email
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 12);

        // Создаем пользователя
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        // Проверяем, что пользователь был создан
        if (newUser.rows.length === 0) {
            return res.status(500).json({ message: 'User creation failed' });
        }

        // Генерируем JWT токен
        const token = jwt.sign(
            { userId: newUser.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } // Добавляем значение по умолчанию
        );

        // Отправляем успешный ответ
        return res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            token,
            user: newUser.rows[0]
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ 
            status: 'error',
            message: 'Internal server error',
            error: error.message // Добавляем сообщение об ошибке для отладки
        });
    }
}

    // Авторизация пользователя
    async login(req, res) {
    const { email, password } = req.body;

    try {
        // Проверяем, существует ли пользователь
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Invalid credentials' 
            });
        }

        // Проверяем пароль
        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Invalid credentials' 
            });
        }

        // Генерируем JWT токен
        const token = jwt.sign(
            { userId: user.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } // Добавляем значение по умолчанию
        );

        // Успешный ответ
        return res.json({
            status: 'success',
            message: 'Logged in successfully',
            token,
            user: {
                id: user.rows[0].id,
                username: user.rows[0].username,
                email: user.rows[0].email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
}

    // Получение информации о текущем пользователе
    async getMe(req, res) {
        try {
            // Пользователь доступен через req.user (устанавливается в authMiddleware)
            const user = await pool.query(
                'SELECT id, username, email FROM users WHERE id = $1',
                [req.user.userId]
            );
            
            if (user.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(user.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = new UserController();
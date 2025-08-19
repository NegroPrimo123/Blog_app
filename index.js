require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

const userRouter = require('./Router/userRouter');
const postRouter = require('./Router/postRouter');
const commentRouter = require('./Router/commentRouter');
const likeRouter = require('./Router/likeRouter');

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// роуты
app.use('/api/auth', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/likes', likeRouter);

// Обработка несуществующих маршрутов
app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
});

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
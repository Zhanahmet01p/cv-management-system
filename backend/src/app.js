const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Чтобы сервер понимал JSON в запросах

// Базовый тестовый роут
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running smoothly' });
});

app.listen(PORT, () => {
  console.log(`Server generated successfully on port ${PORT}`);
});
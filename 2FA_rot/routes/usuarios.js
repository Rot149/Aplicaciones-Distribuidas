const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Obtener perfil propio
router.get('/perfil', authenticateToken, async (req, res) => {
  try {
    const userModel = new User(req.db);
    const user = await userModel.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    // No devolver el password
    const { password, ...userData } = user;
    res.json(userData);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// (Opcional) Listar todos los usuarios (solo admin, pero aquí ejemplo simple)
router.get('/', authenticateToken, async (req, res) => {
  const userModel = new User(req.db);
  const users = await userModel.collection.find({ deleted: false }).project({ password: 0 }).toArray();
  res.json(users);
});

module.exports = router;
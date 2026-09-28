const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Pin = require('../models/Pin');
const { comparePassword } = require('../utils/hash');
const { sendPinEmail } = require('../utils/mailer');

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { usuario, correo, password, name } = req.body;
    if (!usuario || !correo || !password || !name) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const userModel = new User(req.db);
    const newUser = await userModel.create({ usuario, correo, password, name });
    res.status(201).json({ message: 'Usuario registrado correctamente', user: newUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login – paso 1: enviar PIN
router.post('/login', async (req, res) => {
  try {
    const { userid, password } = req.body;
    if (!userid || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }
    const userModel = new User(req.db);
    const user = await userModel.findByLogin(userid);
    if (!user) return res.status(401).json({ error: 'Usuario no registrado' });
    
    if (!comparePassword(password, user.password)) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    
    // Generar PIN de 6 dígitos
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
    
    const pinModel = new Pin(req.db);
    await pinModel.create(user._id, pin, expiresAt);
    
    // Enviar por correo
    await sendPinEmail(user.correo, pin);
    
    // Generar token temporal (solo para asociar el proceso de verificación)
    const tempToken = jwt.sign(
      { userId: user._id, step: 'awaiting_pin' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );
    
    res.json({ message: 'PIN enviado a tu correo', tempToken, expiresIn: '5 minutos' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Verificar PIN y obtener token final
router.post('/verify-pin', async (req, res) => {
  try {
    const { pin, tempToken } = req.body;
    if (!pin || !tempToken) {
      return res.status(400).json({ error: 'PIN y token temporal requeridos' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      if (decoded.step !== 'awaiting_pin') throw new Error();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    
    const pinModel = new Pin(req.db);
    const result = await pinModel.verify(decoded.userId, pin);
    if (!result.success) {
      let message = 'PIN incorrecto o expirado';
      if (result.reason === 'max_attempts') message = 'Demasiados intentos fallidos. Solicita un nuevo PIN.';
      if (result.reason === 'invalid_pin') message = `PIN incorrecto. Te quedan ${result.attemptsLeft} intentos.`;
      return res.status(401).json({ error: message });
    }
    
    // Generar token de acceso final
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    const userModel = new User(req.db);
    await userModel.updateLastLogin(decoded.userId);
    
    res.json({ message: 'Acceso concedido', accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
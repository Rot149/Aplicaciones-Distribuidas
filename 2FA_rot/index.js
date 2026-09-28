require('dotenv').config({ path: '.env'});
require('node:dns/promises').setServers(["1.1.1.1", "8.8.8.8"]);
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let db;

async function connectDB() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    db = client.db();
    console.log('✅ Conectado a MongoDB');
    
    // Middleware para pasar db a las rutas
    app.use((req, res, next) => {
      req.db = db;
      next();
    });
    
    app.use('/auth', authRoutes);
    app.use('/usuarios', usuariosRoutes);
    
    app.get('/', (req, res) => {
      res.send('API 2FA funcionando 🚀');
    });
    
    app.listen(port, () => {
      console.log(`Servidor en http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  }
}

connectDB();
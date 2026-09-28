const { ObjectId } = require('mongodb');
const { hashPassword } = require('../utils/hash');

class User {
  constructor(db) {
    this.collection = db.collection('usuarios');
  }

  async create(userData) {
    const { usuario, correo, password, name } = userData;
    const existing = await this.collection.findOne({
      $or: [{ usuario }, { correo }]
    });
    if (existing) throw new Error('Usuario o correo ya registrado');

    const newUser = {
      usuario,
      correo,
      password: hashPassword(password),
      name,
      deleted: false,
      createdAt: new Date(),
      lastLogin: null,
      twoFactorEnabled: true,
    };
    const result = await this.collection.insertOne(newUser);
    return { _id: result.insertedId, usuario, correo, name };
  }

  async findByLogin(login) {
    return await this.collection.findOne({
      $or: [{ usuario: login }, { correo: login }],
      deleted: false
    });
  }

  async findById(id) {
    const _id = id instanceof ObjectId ? id : new ObjectId(id);
    return await this.collection.findOne({ _id, deleted: false });
  }

  async updateLastLogin(id) {
    const _id = id instanceof ObjectId ? id : new ObjectId(id);
    await this.collection.updateOne(
      { _id },
      { $set: { lastLogin: new Date() } }
    );
  }
}

module.exports = User;
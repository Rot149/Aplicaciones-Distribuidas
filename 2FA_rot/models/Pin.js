const { ObjectId } = require('mongodb');

class Pin {
  constructor(db) {
    this.collection = db.collection('pins');
  }

  async create(userId, pin, expiresAt) {
    // Asegurar que userId sea ObjectId
    const id = userId instanceof ObjectId ? userId : new ObjectId(userId);
    // Limpiar PINs anteriores del mismo usuario
    await this.collection.deleteMany({ userId: id });
    
    const pinDoc = {
      userId: id,
      pin,
      expiresAt,
      attempts: 0,
      createdAt: new Date()
    };
    await this.collection.insertOne(pinDoc);
  }

  async verify(userId, pin) {
    const id = userId instanceof ObjectId ? userId : new ObjectId(userId);
    const pinDoc = await this.collection.findOne({
      userId: id,
      expiresAt: { $gt: new Date() }
    });
    if (!pinDoc) return { success: false, reason: 'no_pin_or_expired' };
    
    // Incrementar intentos
    await this.collection.updateOne(
      { _id: pinDoc._id },
      { $inc: { attempts: 1 } }
    );
    
    if (pinDoc.attempts >= 3) {
      await this.collection.deleteOne({ _id: pinDoc._id });
      return { success: false, reason: 'max_attempts' };
    }
    
    if (pinDoc.pin !== pin) {
      return { success: false, reason: 'invalid_pin', attemptsLeft: 3 - (pinDoc.attempts + 1) };
    }
    
    // PIN correcto: eliminar y retornar éxito
    await this.collection.deleteOne({ _id: pinDoc._id });
    return { success: true };
  }

  async deleteByUserId(userId) {
    const id = userId instanceof ObjectId ? userId : new ObjectId(userId);
    await this.collection.deleteMany({ userId: id });
  }
}

module.exports = Pin;
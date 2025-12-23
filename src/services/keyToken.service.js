'use trict';
const keytokenModel = require('../models/keyToken.model');
const { Types } = require('mongoose');

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => { 
    try { 
      // level 0
      // const tokens = await keytokenModel.create({ 
      //   user: userId,
      //   publicKey,
      //   privateKey
      // });
      // return tokens ?  tokens.publicKey : null;
      const filter = { user: userId },
        update = { publicKey, privateKey, refreshTokensUsed: [], refreshToken },
        options = { upsert: true, new: true };

      const tokens = await keytokenModel.findOneAndUpdate(filter, update, options);
      return tokens ? tokens.publicKey : null;
    } catch (err) {
      
      return err;
    }
  }

  static findByUserId = async (userId) => {
   return await keytokenModel.findOne({ user: userId });
  }

  static removeKeyById = async (id) => { 
    return await keytokenModel.deleteOne({ _id: id });
  }

  static findByRefreshTokenUsed = async (refreshToken) => { 
    return await keytokenModel.findOne({ 
      refreshTokensUsed: refreshToken 
    }).lean();
  }

  static deleteKeyById = async (userId) => { 
    return await keytokenModel.deleteOne({ user: userId });
  }

  static findByRefreshToken = async (refreshToken) => { 
    return await keytokenModel.findOne({ refreshToken});  
  }
}

module.exports = KeyTokenService;

'use strict';

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const KeyTokenService = require('../services/keyToken.service');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response");


// service
const { findByEmail } = require('./shop.service');

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
}

class AccessService {
  
  /**
   *  check this token used
   */
  static handleRefreshTokenUsed = async (refreshToken) => { 
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);

    // check xem token nay da duoc su dung chua
    if (foundToken) { 
      // decode xem may la thang nao
      const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey);
      console.log(`decode refresh token::`, userId, email);

      // xóa tat ca token trong keyStore
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError('Something wrong happend! Please re-login!');
    }

    // ok all good
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if(!holderToken) throw new NotFoundError('Shop not registered! 1');

    // verify Token
    const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey);
    console.log('[2] --', { userId, email });
    // check userId
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new NotFoundError('Shop not registered! 2');

    // create 1 cặp token mới
    const tokens = await createTokenPair( 
      { userId, email }, 
      holderToken.publicKey,
      holderToken.privateKey
    );

    // update token vào db
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken // đã được sử dụng để lấy token mới
      }
    });

    return {
      user: { userId, email },
      tokens
    }
  }

   static handleRefreshTokenUsedV2 = async ({ keyStore, user, refreshToken }) => { 
    const { userId, email} = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) { 
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError('Something wrong happend! Please re-login!');
    }

    if (keyStore.refreshToken !== refreshToken) { 
      throw new AuthFailureError('Shop not registered!');
    }

    // check userId
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new NotFoundError('Shop not registered! 2');

    // create 1 cặp token mới
    const tokens = await createTokenPair( 
      { userId, email }, 
      keyStore.publicKey,
      keyStore.privateKey
    );

    // update token vào db
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken // đã được sử dụng để lấy token mới
      }
    });

    return {
      user,
      tokens
    }
  }

  /**
   * 1 - check email in dbs
   * 2 - match password
   * 3 - create Access token, Refresh token
   * 4 - generate tokens
   * 5 - get data return login
   */
  static login = async ({ email, password, refreshToken = null }) => {
    // 1.
    const foundShop = await findByEmail({ email });
    if (!foundShop)  throw new BadRequestError('shop not registered!');
    
    // 2.
    const match = await bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError('Authentication failure!');
    
    // 3.
    // created private key, public key
    const privateKey = crypto.randomBytes(64).toString('hex');
    const publicKey = crypto.randomBytes(64).toString('hex');

    // 4 - generate tokens
    const { _id: userId} = foundShop;
    const tokens = await createTokenPair( 
      { userId, email }, publicKey, privateKey);

    await KeyTokenService.createKeyToken({
      userId,
      refreshToken: tokens.refreshToken,
      publicKey,
      privateKey
    });

    return {
      shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: foundShop }),
      tokens
    }
  }

  static signUp = async ({ name, email, password }) => {
      // step 1: check email exists ??
      const hoderShop = await shopModel.findOne({ email }).lean();
      if (hoderShop) {  
        throw new BadRequestError('Error: shop already registered!');
      }
      
      const passwordHash = await bcrypt.hash(password, 10);

      const newShop = await shopModel.create({ 
        name, email, password: passwordHash, roles: [RoleShop.SHOP]
      });

      if (newShop) {
        // create privatekey, publickey
        // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { 
        //   modulusLength: 4096,
        //   publicKeyEncoding: {
        //     type: 'pkcs1',
        //     format: 'pem'
        //   },

        //   privateKeyEncoding: {
        //     type: 'pkcs1',
        //     format: 'pem'
        //   }
        // });
        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        console.log({ privateKey, publicKey}) // save collection KeyStore
        const keyStore = await KeyTokenService.createKeyToken({ 
          userId: newShop._id,
          publicKey,
          privateKey
        });

        if (!keyStore) { 
          throw new BadRequestError('Error: keyStore error!');
          // return {
          //   code: 'xxx',
          //   message: 'keyStore error',
          // }
        }

        // const publicKeyObject = crypto.createPublicKey(publicKeyString);

        // create token pair
        const tokens = await createTokenPair( 
          { userId: newShop._id, email }, 
          publicKey,
          privateKey
        );

        console.log(`created tokens::`, tokens);
        return { 
          code: '201',
          metadata: { 
            shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: newShop }),
            tokens
           }
        }
       }

      return {
        code: 200,
        metadata: null,
      }
  } 

  static logout = async (keyStore) => { 
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    console.log(`deleted key::`, delKey);
    return delKey;
  }
}


module.exports = AccessService;
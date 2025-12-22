'use strict';

const JWT = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');

// services
const { findByUserId } = require('../services/keyToken.service');
const { Types } = require('mongoose');

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization'
}

const createTokenPair = async (payload, publicKey, privateKey) => { 
  try {
    // access token
    const accessToken = await JWT.sign(payload, publicKey, { 
      // algorithm: 'RS256',
      expiresIn: '2 days',
    });

    const refreshToken = await JWT.sign(payload, privateKey, { 
      // algorithm: 'RS256',
      expiresIn: '7 days',
    });


    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`Error verify::`, err);
      } else {
        console.log(`Decode verify::`, decode);
      }
    });
    return { accessToken, refreshToken };
  } catch (err) {
    return err;
  }
};

const verifyJWT = async (token, keySecret) => { 
  return await JWT.verify(token, keySecret);
}

const authentication = asyncHandler( async (req, res, next) => {
  /**
   * 1 - Check userId  missing
   * 2 -  get accessToken
   * 3 - verify accessToken
   * 4 - check user in dbs
   * 5 - check keyStore with userId
   * 6 - Ok all => return next()
   */
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError('Invalid request!');

  // 2
  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError('Not found key store!');

  // 3
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError('Invalid request!');

  console.log('accessToken:', accessToken);
  try {
    const decodeUser = await JWT.verify(accessToken, keyStore.publicKey);
    console.log('decodeUser:', decodeUser);
    if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid user!');
    
    req.keyStore = keyStore;
    return next();
  } catch (err) {
    throw err;
  }
});

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT
};
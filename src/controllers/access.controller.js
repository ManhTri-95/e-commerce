'use strict';

const AccessService = require("../services/access.service");

const { OK, CREATED, SuccessResponse  } = require("../core/success.response");
class AccessController {
  handerRefreshToken = async (req, res, next) => { 
    new SuccessResponse({
      metadata: await AccessService.handleRefreshTokenUsed(req.body.refreshToken),
      message: 'Get new token successfully'
    }).send(res);
  }

  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body)
    }).send(res);
      /**
       * 200 OK
       * 201 Create
      */ 
  }

  signUp = async (req, res, next) => {
      console.log(`[P]::signUp::`, req.body);
      /**
       * 200 OK
       * 201 Create
       */

      new CREATED({
        message: 'Shop created successfully',
        metadata: await AccessService.signUp(req.body),
        options: {
          limit: 10
        }
      }).send(res);
      //
  }

  logout = async (req, res, next) => {
    //
    new SuccessResponse({
      message: 'Logout successfully',
      metadata: await AccessService.logout(req.keyStore)
    }).send(res);
  }
  
}

module.exports = new AccessController();
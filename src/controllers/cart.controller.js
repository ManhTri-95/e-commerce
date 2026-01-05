'use strict';

const CartService = require("../services/cart.service");

const { OK, CREATED, SuccessResponse  } = require("../core/success.response");


class CartController {
  addToCart = async (req, res, next) => { 
    // new
    new SuccessResponse({
      metadata: await CartService.addToCart({ 
        userId: req.body.userId, 
        product: req.body.product 
      }),
      message: 'Add to cart successfully'
    }).send(res);
  }

  updateCart = async (req, res, next) => { 
    // update
    new SuccessResponse({
      metadata: await CartService.addToCartV2(req.body),
      message: 'Update cart successfully'
    }).send(res);
  }

  deleteCart = async (req, res, next) => { 
    // delete
    new SuccessResponse({
      metadata: await CartService.deleteUserCart({ 
        userId: req.body.userId,
        productId: req.body.productId
      }),
      message: 'Delete cart successfully' 
    }).send(res);
  }

  listToCart = async (req, res, next) => { 
    // list
    new SuccessResponse({
      metadata: await CartService.getListUserCart({ 
        userId: req.query.userId
      }),
      message: 'Get cart successfully'
    }).send(res);
  } 
}

module.exports = new CartController();
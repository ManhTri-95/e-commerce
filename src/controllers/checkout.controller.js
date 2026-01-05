'use strict';

const CheckoutService = require("../services/checkout.service");

const { OK, CREATED, SuccessResponse  } = require("../core/success.response");


class CheckoutController {
  checkoutReview = async (req, res, next) => { 
    // new
    new SuccessResponse({
      metadata: await CheckoutService.processCheckout(req.body),
      message: 'Checkout review successfully'
    }).send(res);
  }

 
}

module.exports = new CheckoutController();
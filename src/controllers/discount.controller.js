'use strict';
const { SuccessResponse } = require('../core/success.response');
const DiscountService = require('../services/discount.service');

class DiscountController {
  //
  creteateDiscountCode = async(req, res, next) => {
    //
    console.log('req.user', req.user.userId);
    new SuccessResponse({
      message: 'Create discount code success!', 
      metadata: await DiscountService.createDiscountCode({ ...req.body, shopId: req.user.userId })
    }).send(res);
  }

  getAllDiscountCodes = async(req, res, next) => {
    new SuccessResponse({
      message: 'Get all discount codes success!', 
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.query,
        shopId: req.user.userId,
      })
    }).send(res);
  }


  getAllDiscountCodeWidthProduct = async(req, res, next) => {
    new SuccessResponse({
      message: 'Get all discount codes with product success!', 
      metadata: await DiscountService.getAllDiscountCodeWidthProduct({
        ...req.query,
      })
    }).send(res);
  }

  getDiscountAmount = async(req, res, next) => {
    new SuccessResponse({
      message: 'Get discount amount success!', 
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      })
    }).send(res);
  } 
}

module.exports = new DiscountController();
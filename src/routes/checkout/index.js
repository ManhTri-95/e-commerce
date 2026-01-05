'use strict';

const express = require('express');
const checkoutController = require('../../controllers/checkout.controller');
const router = express.Router();
const asyncHandler = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

// router.post('', asyncHandler(cartController.addToCart));
// router.delete('', asyncHandler(cartController.deleteCart));
// router.post('/update', asyncHandler(cartController.updateCart));
router.post('/review', asyncHandler(checkoutController.checkoutReview));

module.exports = router;
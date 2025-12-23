'use strict';

const express = require('express');
const productController = require('../../controllers/product.controller');
const router = express.Router();
const asyncHandler = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils');

// Authentication
router.use(authenticationV2);

router.post('', asyncHandler(productController.createProduct));
// router.post('/shop/refresh-token', asyncHandler(productController.handerRefreshToken));

module.exports = router;
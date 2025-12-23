'use strict';

const express = require('express');
const productController = require('../../controllers/product.controller');
const router = express.Router();
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const { apiKey, permission } = require('../../auth/checkAuth');


// check apiKey
router.use(apiKey);

// check permission
router.use(permission('0000'));

// Authentication
router.use(authentication);

router.post('/product', asyncHandler(productController.createProduct));
// router.post('/shop/refresh-token', asyncHandler(productController.handerRefreshToken));

module.exports = router;
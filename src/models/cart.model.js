'use-strict'

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Cart';
const COLLECTION_NAME = 'Carts';

const cartSchema = new Schema({ 
  cart_state: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'COMPLETED', 'FAILED'],
    default: 'ACTIVE'
  },
  cart_products: {
    type: Array,
    required: true,
    default: []
  },
  /**
   * [{
   *  productId,
   *  shopId,
   *  quantity,
   *  name,
   *  price
   * }]
   */

  cart_count_products: {
    type: Number,
    required: true,
    default: 0
  },
  cart_userId: {
    type: Number,
    required: true
  }
}, {
  timestamps: {
    createdAt: 'createdOn',
    updatedAt: 'modifiedOn'
  },
  collection: COLLECTION_NAME
});

module.exports = {
  cart: model(DOCUMENT_NAME, cartSchema)
}
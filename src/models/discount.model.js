'use strict';

const { Schema, model } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'discount';
const COLLECTION_NAME = 'Discounts';


// Declare the Schema of the Mongo model
const discountSchema = new Schema({
  discount_name: { type: String, required: true }, //Summer Sale
  discount_description: { type: String }, // Big sale for summer
  discount_type: { type: String, default: 'fixed_amount' }, // percentage, fixed amount, buy one get one
  discount_value: { type: Number, required: true }, // 20 (%), 10 ($)
  discount_code: { type: String, required: true, unique: true }, // SUMMER2023
  discount_start_date: { type: Date, required: true }, // ngay bat dau
  discount_end_date: { type: Date, required: true }, // ngay ket thuc
  discount_max_uses: { type: Number, required: true }, // so luong discount dc ap dung
  discount_uses_count: { type: Number, required: true }, // so luong discount da dc ap dung
  discount_users_used: { type: Array, default: [] }, // danh sach user da su dung discount
  discount_max_uses_per_user: { type: Number, required: true }, // so luong discount dc ap dung cho moi user
  discount_min_order_value: { type: Number, required: true }, // gia tri don hang toi thieu de ap dung discount
  discount_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
  discount_is_active: { type: Boolean, default: true  }, // trang thai discount
  discount_applies_to: { type: String, required: true, enum: ['all', 'specific'] }, // all_products, specific_products
  discount_product_ids: { type: Array, default: [] } // danh sach san pham dc ap dung discount
}, {
  timestamps: true,
  collection: COLLECTION_NAME
});

//Export the model
module.exports = {
  discount: model(DOCUMENT_NAME, discountSchema)
};
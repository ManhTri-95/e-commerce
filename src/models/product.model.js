'use strict'

const { Schema, model } = require("mongoose");
const slugify = require('slugify');

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

const productSchema = new Schema({
  product_name: { type: String, required: true }, //Quần jean cao cấp
  product_thumb: { type: String, required: true },
  product_description: String,
  product_slug: String, // quan-jean-cao-cap
  product_price: { type: Number, required: true },
  product_quantity: { type: Number, required: true },
  product_type: {
    type: String,
    required: true,
    enum: ['Electronic', 'Clothing', 'Furniture']
  },
  product_shop: { type: Schema.Types.ObjectId, ref: 'Shop'},
  product_attributes: { type: Schema.Types.Mixed, required: true },
  // more
  product_ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be at least 1.0'],
    max: [5, 'Rating must be at most 5.0'],
    set: val => Math.round(val * 10) / 10 // 4.6666 => 4.7
  },
  product_variations: { 
    type: Array, 
    default: []
  },
  isDraft: { 
    type: Boolean,
    default: true,
    index: true,
    select: false
  },
  isPublished: { 
    type: Boolean,
    default: false,
    index: true,
    select: false
  }
}, {
  timestamps: true,
  collection: COLLECTION_NAME
});

// create index for search 
productSchema.index({ product_name: 'text', product_description: 'text' })

// Document middleware: runs before .save() and .create()
productSchema.pre('save', async function () {
  this.product_slug = slugify(this.product_name, { lower: true });
});

//define the product type = clothing
const clothingSchema = new Schema({ 
  brand: {
    type: String,
    required: true
  },
  size: String,
  material: String,
  product_shop: { type: Schema.Types.ObjectId, ref: 'Shop'},
}, {
  collection: 'clothes',
  timestamps: true
});


// define the product type = electronics
const electronicSchema = new Schema({ 
  manufacturer: {
    type: String,
    required: true
  },
  model: String, 
  color: String,
  product_shop: { type: Schema.Types.ObjectId, ref: 'Shop'},
}, {
  collection: 'electronics',
  timestamps: true
});

const furnitureSchema = new Schema({ 
  brand: {
    type: String,
    required: true
  },
  size: String,
  material: String,
  product_shop: { type: Schema.Types.ObjectId, ref: 'Shop'},
}, {
  collection: 'furnitures',
  timestamps: true
});

module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  clothing: model('Clothing', clothingSchema),
  electronic: model('Electronic', electronicSchema),  
  furniture: model('Furniture', furnitureSchema)
}




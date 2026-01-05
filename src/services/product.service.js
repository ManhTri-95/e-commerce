'use strict';

const { product, clothing, electronic } = require('../models/product.model');
const { BadRequestError } = require('../core/error.response');

// define factory class pattern tp cretate product service
class ProductFactory { 
  /**
   * type: 'Clotning',
   * payload
   */
  static async createProduct(type, payload) {
    switch (type) {
      case 'Clothing': {
        return new Clothing(payload).createProduct();
      }
      case 'Electronics': {
        return new Electronic(payload).createProduct();
      }

      case 'Furniture': {
        return new Furniture(payload).createProduct();
      }
      default:
        throw new BadRequestError(`Invalid product type ${type}`);
    }
  }
}

// define product class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,  
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity; 
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  // create new product
  async createProduct (product_id) {
    return await product.create({ ...this, _id: product_id });
  }
}


// Define sub-class for different product types clothing
class Clothing extends Product {

  async createProduct() {
    // create clothing attributes first
    const newClothing = await clothing.create(this.product_attributes); 
    if (!newClothing) throw new BadRequestError('Create clothing attributes error');

    const newProduct = await super.createProduct();
    if (!newProduct) throw new BadRequestError('Create new product error');
    return newProduct;
  }  
}

class Electronic extends Product {

  async createProduct() {
    // create clothing attributes first
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    }); 
    if (!newElectronic) throw new BadRequestError('Create electronic attributes error');

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError('Create new product error');
    return newProduct;
  }  
}

class Furniture extends Product {

  async createProduct() {
    // create clothing attributes first
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    }); 
    if (!newFurniture) throw new BadRequestError('Create furniture attributes error');
    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError('Create new product error');
    return newProduct;
  }  
}


module.exports = {
  ProductFactory,
  Clothing,
  Electronic
};  

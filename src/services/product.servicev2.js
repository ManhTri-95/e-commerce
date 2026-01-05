'use strict';

const { product, clothing, electronic } = require('../models/product.model');
const { insertInventory } = require('../models/repositories/inventory.repo');
const { BadRequestError } = require('../core/error.response');
const { 
  findAllDraftForShop, 
  publishProductByShop, 
  findAllPublishForShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById
} = require('../models/repositories/product.repo');

const { removeUndefinedObject, updateNestedObject } = require('../utils');

// define factory class pattern tp cretate product service
class ProductFactory { 
  /**
   * type: 'Clotning',
   * payload
   */

  static productRegistry = {};

  static registerProductType(type, cls) {
    ProductFactory.productRegistry[type] = cls;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];

    if (!productClass) {
      throw new BadRequestError(`Invalid product type ${type}`);
    }

    return new productClass(payload).createProduct();
  }

  static async updateProduct (type, product_id, payload) {
    const productClass = ProductFactory.productRegistry[type];

    if (!productClass) {
      throw new BadRequestError(`Invalid product type ${type}`);
    }

    return new productClass(payload).updateProduct(product_id);
  }

  // static  async updateProduct(product_id, payload) { 
  //   return await updateProductById({ product_id, payload, model: product });
  // }

  // PUT
  static async publishProductByShop ({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }

  static async unPublishProductByShop ({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id });
  }

  // QUERY
  static async findAllDraftForShop({ product_shop, limit = 50, skip = 0 }) { 
    const query = { product_shop, isDraft: true };
    return await findAllDraftForShop({ query, limit, skip });
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) { 
    const query = { product_shop, isPublished: true };
    return await findAllPublishForShop({ query, limit, skip });
  }

  static async findAllProducts () {
    return await searchProductByUser();
  }

  static async searchProducts({ keySearch}) { 
    return await searchProductByUser({ keySearch });
  }

  static async findAllProducts ({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true }}) {
    return await findAllProducts({ limit, sort, page, filter, select: ['product_name', 'product_thumb', 'product_price', 'product_shop'] });
  }

  static async findProduct ({ product_id}) {
    return await findProduct({ product_id, unSelect: ['__v', 'product_variations'] });
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
    const newProduct = await product.create({ ...this, _id: product_id });
    if (newProduct) {
      // add product_stock in inventory collection
      await insertInventory({ 
        productId: newProduct._id, 
        shopId: this.product_shop, 
        stock: this.product_quantity, 
        localation: 'unknown' 
      });
    }

    return newProduct;
  }

  // update Product
  async updateProduct (product_id, payload) {
    return await updateProductById({ product_id, payload, model: product });
  }
}


// Define sub-class for different product types clothing
class Clothing extends Product {

  async createProduct() {
    // create clothing attributes first
    const newClothing = await clothing.create(
      {
        ...this.product_attributes,
        product_shop: this.product_shop
      }
    ); 
    if (!newClothing) throw new BadRequestError('Create clothing attributes error');

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError('Create new product error');
    return newProduct;
  }

    async updateProduct(product_id) { 
      /**
       * {
       *  a: undefined,
       *  b: null
       * }
       */
      // 1. Remove attr has null/undefined values
      // console.log('1::',  this);
      const objectParams = removeUndefinedObject(this);
      // console.log('2::',  objectParams);
      // 2. check xem updaTE chỗ nào
      if (objectParams.product_attributes) {
        // update child
        await updateProductById({ 
          product_id, 
          payload: updateNestedObject(objectParams.product_attributes), 
          model: clothing 
        });
      }

      const updateProduct = await super.updateProduct(product_id, updateNestedObject(objectParams));
      return updateProduct;
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

ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Electronic', Electronic);
ProductFactory.registerProductType('Furniture', Furniture);

module.exports = {
  ProductFactory,
  Clothing,
  Electronic
};  

'use strict'

const { BadRequestError, NotFoundError } = require('../core/error.response');
const { cart } = require('../models/cart.model');
const { getProductById } = require('../models/repositories/product.repo');
/**
 * Key Features of Cart Service
 * 1 - Add product to cart [User]
 * 3 - Remove product from cart [User]
 * 4 - Reduce product quantity in cart [User]
 * 5 - Get cart details [User]
 * 6 - Delete cart [User]
 * 7 - Delete cart item [User]
 */

class CartService {
  // Start repo cart
  static async createUserCart({ userId, product }) { 
    const query = { cart_userId: userId, cart_state: 'ACTIVE' },
    updateOrInsert = { 
      $addToSet: { 
        cart_products: product 
      },
      
    }, options = { upsert: true, new: true };

    return await cart.findOneAndUpdate(query, updateOrInsert, options);
  }

  static async updateUserCartQuantity({ userId, product }) { 
    const { productId, quantity } = product;
    
    // Check if product exists in cart
    const query = { 
      cart_userId: userId, 
      'cart_products.productId': productId,
      cart_state: 'ACTIVE'
    };
    
    const result = await cart.findOneAndUpdate(
      query,
      { $inc: { 'cart_products.$.quantity': quantity } },
      { new: true }
    );
    
    // If product not found, add it as new product
    if (!result) {
      return await this.createUserCart({ userId, product });
    }
    
    return result;
  }

  // end repo cart


  static async addToCart ({ userId,  product = {}}) { 
    // check cart exists
    const userCart = await cart.findOne({ cart_userId: userId });

    if (!userCart) { 
      // create new cart
      return await this.createUserCart({ userId, product });
    }

    // neu gio hang rong => add san pham
    if (!userCart.cart_products.length) { 
      return await this.createUserCart({ userId, product });
    }

    // gio hang ton tai va co san pham roi => kiem tra product ton tai va update quantity, neu khong thi add
    return await this.updateUserCartQuantity({ userId, product });
  }

  // update cart
  /**
   * shop_order_ids: [
   * { 
   *    shopId,
   *    item_products:  [
   *      { 
   *        shopId, 
   *        quantity, 
   *        old_quantity, 
   *        price,
   *        productId
   *      }
   *    ],
   *   version
   *  }
   * ]
   */
  static async addToCartV2 ({ userId, shop_order_ids = {} }) { 
    const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0];

    // check products
    const foundProduct = await getProductById(productId);
    if (!foundProduct) throw new NotFoundError('Product not found');

    // compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) { 
      throw new BadRequestError('Product not belong to shop');
    }

    if (quantity === 0 ) {
      // delete
    }

    return await this.updateUserCartQuantity({ 
      userId, 
      product: {
        productId,
        quantity: quantity - old_quantity
      }
    });
  }

  static async deleteUserCart ({ userId, productId }) {
    const query = { cart_userId: Number(userId), cart_state: 'ACTIVE' };
    const updateSet = { 
      $pull: { 
        cart_products: { 
          productId
        } 
      }
    };

    const deletedCart = await cart.updateOne(query, updateSet);
    return deletedCart;
  }

  static async getListUserCart ({ userId }) { 
    return await cart.findOne({ cart_userId: Number(userId), cart_state: 'ACTIVE' }).lean();
  }
}

module.exports = CartService;
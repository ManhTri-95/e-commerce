'use strict';

const { findCartById } = require('../models/repositories/cart.repo');
const { checkProductByServer } = require('../models/repositories/product.repo');
const { getDiscountAmount } = require('./discount.service');

const { BadRequestError, NotFoundError } = require('../core/error.response');

class CheckoutService {
  // login and without login
  /**
    {
      cartId: 'abc123',  
      userId: 'user,
      shop_order_ids: [
        {
          shopId: 'shop123',
          shop_discounts: [],
          items_products: [
            {
              productId: 'prod123',
              quantity: 2,
              price: 100
            },
          ]
        },
        {
          shopId: 'shop457',
          shop_discounts: [{
            codeId: 'DISCOUNT10',
            discouniId: 'disc123',
            shopId: 'shop457'          
          }],
          items_products: [
            {
              productId: 'prod123',
              quantity: 2,
              price: 100
            },
          ]
        }
      ]
    } 
   */

  static async processCheckout({ cartId, userId, shop_order_ids = [] }) {
    // check cartId exists
    const foundCart = await findCartById(cartId);
    if (!foundCart) {
      throw new BadRequestError('Cart not found or inactive');
    }

    const checkout_order = {
      totalPrice: 0, // tong tien hang
      feeShip : 0,   // phi van chuyen
      totalDiscount: 0, // tong giam gia
      totalCheckout: 0 // thanh toan
    }, shop_order_ids_new = [];

    // tinh tong tien bill
    for (const shop_order of shop_order_ids) { 
      const { shopId, shop_discounts = [], items_products = [] } = shop_order;
      // check product available
      const checkProductService = await checkProductByServer(items_products);
      console.log('checkProductService', checkProductService);

      if (!checkProductService[0]) { 
        throw new BadRequestError(`Order wrong!!!`);
      }

      // tong tien don hang
      const checkoutPrice = checkProductService.reduce((acc, item) => acc + (item.price * item.quantity), 0);

      // tong tien truoc khi xu ly
      checkout_order.totalPrice += checkoutPrice;

      // tinh giam gia
      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice, // tien truoc khi gianm gia,
        priceApplyDiscount: checkoutPrice, // tien sau khi giam gia
        items_products: checkProductService
      };

      // neu shop_discounts ton tai > 0, check xem co hop le hay khong
      if (shop_discounts.length > 0) { 
        // gia su chi co 1 discount
        // get discount amount
        const { totalPrice = 0, discount = 0} = getDiscountAmount({
          userId,
          shopId,
          codeId: shop_discounts[0].codeId,
          products: checkProductService
        });

        // tong cong discount giam gia
        checkout_order.totalDiscount += discount;

        if (discount > 0) { 
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }

        // tong tien thamnh toan cuoi cung
        checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
        shop_order_ids_new.push(itemCheckout);
      }
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order
    }
  }
}


module.exports = CheckoutService;
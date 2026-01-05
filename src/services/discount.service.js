'use strict'

const { BadRequestError, NotFoundError } = require('../core/error.response');
const { discount } = require('../models/discount.model');
const { 
  updateDiscountCodeById, 
  findAllDiscountCodesUnselect, 
  findAllDiscountCodesSelect,
  checkDiscountCodeExists
 } = require('../models/repositories/discount.repo');
const { findAllProducts } = require('../models/repositories/product.repo');
const { removeUndefinedObject, updateNestedObject } = require('../utils');

/**
 * Discount Service
 * 1 - Generatior discount codes [Shop | Admin]
 * 2 - Get discount amount [User]
 * 3 - Get all discount codes [User | Shop]
 * 4 - Verify discount code [User]
 * 5 - Delete discount code [Shop | Admin]
 * 6 - Cancel discount code [User]
 * 
 */

class DiscountService {
  // 1 - Generatior discount codes [Shop | Admin] 
  static async createDiscountCode(payload) { 
    console.log('Payload:', payload);
    const { 
      code, 
      start_date, 
      end_date, 
      is_active, 
      shopId, 
      min_order_value, 
      product_ids, 
      applies_to, 
      name, 
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      max_uses_per_user
    } = payload;

    console.log(shopId);
    console.log('Start Date:', new Date(start_date));
    // kiem tra
    if (new Date() > new Date(start_date) || new Date() > new Date(end_date)) { 
      throw new BadRequestError('Invalid discount code date range');
    }

    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError('Start date must be before end date');
    }

    // create index for discount code
    const foundDiscount = await discount.findOne({ 
      discount_code: code, 
      discount_shopId: shopId 
    }).lean();

    if (foundDiscount && foundDiscount.discount_is_active) { 
      throw new BadRequestError('Discount code already exists');
    }

    return await discount.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,  
      discount_start_date: start_date,
      discount_end_date: end_date,
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_order_value: min_order_value,
      discount_shopId: shopId,
      discount_is_active: is_active, 
      discount_applies_to: applies_to,
      discount_product_ids: product_ids,
    });
  }

  static async updateDiscountCode (discountId, payload) { 
    const objectParams = removeUndefinedObject(payload);

    await updateDiscountCodeById({
      discountId,
      payload: await updateNestedObject(objectParams)
    });
  }

  // get all discount codes available for with products
  static async getAllDiscountCodeWidthProduct ({ code, shopId, userId, limit, page }) { 
    // create index for discount code
    const foundDiscount = await discount.findOne({ 
      discount_code: code, 
      discount_shopId: shopId 
    }).lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) { 
      throw new BadRequestError('Discount code not found or inactive');
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;

    let products;
    if (discount_applies_to === 'all') {
      // get all products
      products = await findAllProducts({ 
        filter: { 
          product_shop: shopId,
          isPublished: true 
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name', 'product_price', 'product_thumb']
      })
    }

    if (discount_applies_to === 'specific') {
      // get specific products
      products = await findAllProducts({ 
        filter: { 
          _id: { $in: discount_product_ids },
          isPublished: true 
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name', 'product_price', 'product_thumb']
      })
    }

    return products;
  }

  // Get all discounnt code of shop 
  static async getAllDiscountCodesByShop ({ limit, page, shopId}) { 
    const discounts = await findAllDiscountCodesUnselect({ 
      limit: +limit, 
      page: +page, 
      filter: { 
        discount_shopId: shopId,
        discount_is_active: true
      },
      unSelect: ['__v', 'discount_shopId'],
      model: discount
    });
    return discounts;
  } 

  /**
  * Apply discount code
  * products = [
  *   {
  *     productId,
  *     shopId,
  *     price,
  *     quantity
  *     name
  *   },
  *   {
  *     productId,
  *     shopId,
  *     price,
  *     quantity
  *     name
  *   }
  * ]
  */
  static async getDiscountAmount ({ codeId, shopId, userId, products }) { 
    const foundDiscount = await checkDiscountCodeExists({
      model: discount,
      filter: { 
        discount_code: codeId,
        discount_shopId: shopId,
      }
    }); 

    if (!foundDiscount) { 
      throw new BadRequestError('Discount code not found');
    }

    const {
      discount_is_active,
      discount_max_uses,
      discount_start_date,
      discount_end_date,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_uses_count,
      discount_users_used,
      discount_type,
      discount_value
    } = foundDiscount;

    if (!discount_is_active) {  
      throw new BadRequestError('Discount expired or inactive');
    }

    // check max uses
    if (discount_max_uses <= discount_uses_count) { 
      throw new BadRequestError('Discount code has reached its maximum number of uses');
    }

    // if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) { 
    //   throw new BadRequestError('Discount code is not valid at this time');
    // }

    // check xem có xét gí trị tối thiểu đơn hàng ko
    let totalOrder = 0;
    if (discount_min_order_value > 0) { 
      // get total
      totalOrder = products.reduce((total, item) => { 
        return total + (item.price * item.quantity);
      }, 0);

      if (totalOrder < discount_min_order_value) { 
        throw new NotFoundError(`Order total must be at least ${discount_min_order_value} to apply this discount`);
      }
    }

    if (discount_max_uses_per_user > 0) { 
      const userUseDiscount = discount_users_used.find(item => item.userId.toString() === userId);
      if (userUseDiscount && userUseDiscount.uses_count >= discount_max_uses_per_user) { 
        throw new BadRequestError('You have reached the maximum number of uses for this discount code');
      }
    }

    // check xem discount này là fixed_amount hay percentage
    const amount = discount_type === 'fixed_amount' 
      ? discount_value
      : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount
    };
  }

  static async deleteDiscountCode ({ shopId, codeId}) { 
    const deleted = await discount.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: shopId
    });

    return deleted;
  }

  /**
   * Cancel discount code
   * @param {*} param
   * @returns 
   */
  static async cancelDiscountCode ({ userId, shopId, codeId}) { 
    const foundDiscount = await checkDiscountCodeExists({   
      model: discount,
      filter: { 
        discount_code: codeId,
        discount_shopId: shopId,
      }
    }); 
    if (!foundDiscount) {
      throw new BadRequestError('Discount code not found');
    }

    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: { 
        discount_users_used: userId 
      },
      $inc: { 
        discount_uses_count: -1,
        discount_max_uses: 1
      }
    });

    return result;
  } 
}

module.exports = DiscountService;


'use strict';
const { inventory } = require('../inventory.model');


const insertInventory = async ({
  productId, shopId, stock, localation = 'unknown'
}) => {
  return await inventory.create({ 
    inven_productId: productId,
    inven_shopId: shopId,
    inven_stock: stock,
    inven_location: localation
  });
}

module.exports = {
  insertInventory
};  
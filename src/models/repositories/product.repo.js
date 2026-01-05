'use strict';

const { product, electronic, clothing, furniture } = require('../product.model');
const { getSelectData, unSelectData } = require('../../utils');

const findAllDraftForShop = async ({ query, limit, skip }) => {
  return await queryProducts({ query, limit, skip });
};

const findAllPublishForShop = async ({ query, limit, skip }) => { 
  return await queryProducts({ query, limit, skip });
};

const searchProductByUser = async ({ keySearch }) => { 
  // Tìm kiếm sản phẩm đã publish theo text index
  console.log('Key Search:', keySearch);
  const results = await product.find(
    { isPublished: true, $text: { $search: keySearch } },
    { score: { $meta: "textScore" } }
  )
  .sort({ score: { $meta: "textScore" } })
  .lean();
  return results;
}

const publishProductByShop = async({ product_shop, product_id }) => { 
  const { modifiedCount } = await product.updateOne(
    { product_shop: product_shop, _id: product_id },
    { $set: { isDraft: false, isPublished: true } }
  );
  return modifiedCount;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => { 
  const { modifiedCount } = await product.updateOne(
    { product_shop: product_shop, _id: product_id },
    { $set: { isDraft: true, isPublished: false } }
  );
  return modifiedCount;
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => { 
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? { _id: -1 } : { id: 1 };
  const products = await product.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()
    .exec();

  return products;
}

const findProduct = async ({ product_id, unSelect = [] }) => {
  return await product.findById(product_id)
    .select(unSelectData(unSelect))
    .lean()
    .exec();
}

const updateProductById = async ({ product_id, payload, model, isNew = true }) => {
  return await model.findByIdAndUpdate(product_id, payload, { new: isNew });
};

const queryProducts = async ({ query, limit, skip }) => { 
  return await product.find(query)
    .populate('product_shop', 'name email -_id')
    .sort({ createdAt: -1 }) 
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const getProductById = async (productId) => { 
  return await product.findOne({ _id: productId }).lean();
}

const checkProductByServer = async (product) => {
  return await Promise.all(product.map(async (productItem) => { 
    const foundProduct = await getProductById(productItem.productId);

    if (foundProduct) { 
      return { 
        price: foundProduct.product_price,
        quantity: productItem.quantity,
        productId: productItem.productId
      }
    }
  }))
}

module.exports = {
  findAllDraftForShop,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
  getProductById,
  checkProductByServer
};
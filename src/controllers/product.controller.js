
const ProductService = require('../services/product.service');
const ProducServiceV2 = require('../services/product.servicev2');
const { SuccessResponse } = require('../core/success.response');

class ProductController {
  createProduct = async (req, res, next) => {
    console.log(`[P]::User::`, req.user);
    // new SuccessResponse({
    //   message: 'Product created successfully',
    //   metadata: await ProductService.ProductFactory.createProduct(req.body.product_type, {
    //       ...req.body,
    //       product_shop: req.user.userId
    //     }
    //   )
    // }).send(res);

    new SuccessResponse({
      message: 'Product created successfully',
      metadata: await ProducServiceV2.ProductFactory.createProduct(req.body.product_type, {
          ...req.body,
          product_shop: req.user.userId
        }
      )
    }).send(res);
  }
  

  // Update Product
  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Update product successfully',
      metadata: await ProducServiceV2.ProductFactory.updateProduct(req.body.product_type, req.params.productId, {
        ...req.body,
        product_shop: req.user.userId
     })
    }).send(res);
  }

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({  
      message: 'Publish Product success!',
      metadata: await ProducServiceV2.ProductFactory.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id
      })
    })
    .send(res);
  }

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({  
      message: 'Unpublish Product success!',
      metadata: await ProducServiceV2.ProductFactory.unPublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id 
      })
    }).send(res);
  }

  // Query 
  /**
   * Retrieves all draft products for the authenticated shop.
   *
   * @async
   * @function
   * @param {Object} req - Express request object containing user and query information.
   * @param {Object} res - Express response object used to send the response.
   * @param {Function} next - Express next middleware function (unused).
   * @returns {Promise<void>} Sends a success response with the list of draft products.
   */
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all drafts for shop successfully',
      metadata: await ProducServiceV2.ProductFactory.findAllDraftForShop({
        product_shop: req.user.userId,
        limit: req.query.limit,
        skip: req.query.skip
      })
    }).send(res);
  }

  /**
   * Retrieves all published products for the current shop.
   *
   * @async
   * @function
   * @param {Object} req - Express request object containing user and query information.
   * @param {Object} res - Express response object used to send the response.
   * @param {Function} next - Express next middleware function (unused).
   * @returns {Promise<void>} Sends a success response with the list of published products.
   */
  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all published for shop successfully',
      metadata: await ProducServiceV2.ProductFactory.findAllPublishForShop({
        product_shop: req.user.userId,
        limit: req.query.limit,
        skip: req.query.skip
      })
    }).send(res);
  }
  

  getListProductsSearch = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get list products search successfully',
      metadata: await ProducServiceV2.ProductFactory.searchProducts(req.params)
    }).send(res);
  }

  getAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get all products successfully',
      metadata: await ProducServiceV2.ProductFactory.findAllProducts(req.query)
    }).send(res); 
  }

  getProduct = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get product successfully',
      metadata: await ProducServiceV2.ProductFactory.findProduct({ product_id: req.params.productId })
    }).send(res);
  }

}

module.exports = new ProductController();
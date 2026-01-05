'use strict';

const discount = require('../discount.model');
const { getSelectData, unSelectData } = require('../../utils');

const updateDiscountCodeById  = async ({ discountId, payload }) => {
  return await discount.findByIdAndUpdate(discountId, payload, { new: true });
}

const findAllDiscountCodesUnselect = async ({ 
  limit = 50, 
  page = 1, 
  sort = 'ctime', 
  filter, 
  unSelect,
   model 
}) => { 
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? { _id: -1 } : { id: 1 };
  const documents = await model.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unSelectData(unSelect))
    .lean();

  return documents;
}

const findAllDiscountCodesSelect = async ({ 
  limit = 50, 
  page = 1, 
  sort = 'ctime', 
  filter, 
  select,
   model 
}) => { 
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? { _id: -1 } : { id: 1 };
  const documents = await model.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

  return documents;
}

const checkDiscountCodeExists = async ({ model, filter }) => {
  return await model.findOne(filter).lean();
}



module.exports = {
  updateDiscountCodeById,
  findAllDiscountCodesUnselect,
  findAllDiscountCodesSelect,
  checkDiscountCodeExists
};
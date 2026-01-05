'use strict';

const _  =  require('lodash');

const getInfoData = ({ fileds = [], object = {} }) => {
  return _.pick(object, fileds);
}

// [ 'name', 'email' ] => { name: 1, email: 1 }
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((field) => [field, 1]));
}

// [ 'name', 'email' ] => { name: 0, email: 0 }
const unSelectData = (unSelect = []) => {
  return Object.fromEntries(unSelect.map((field) => [field, 0]));
}

const removeUndefinedObject = obj => {
 Object.keys(obj).forEach(key => {
    if (obj[key] === null) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' 
        && !Array.isArray(obj[key]) 
        && obj[key] !== null
      ) {
      removeUndefinedObject(obj[key]);
    }
  });
  return obj;
}

/**
 * const a = {
 *  c: {
 *    d: 1,
 *    e: 2
 *  },
 * }
 * 
 * => db.collection.update({}, { $set: { 'c.d': 1, 'c.e': 2 } })
 */
const updateNestedObject = obj => {
  const final = {};

  Object.keys(obj).forEach(key => {
    if (
      typeof obj[key] === 'object' &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      const nested = updateNestedObject(obj[key]);
      Object.keys(nested).forEach(nestedKey => {
        final[`${key}.${nestedKey}`] = nested[nestedKey];
      });
    } else {
      final[key] = obj[key];
    }
  });

  return final;
};

module.exports = {
  getInfoData,
  getSelectData,
  unSelectData,
  removeUndefinedObject,
  updateNestedObject
};
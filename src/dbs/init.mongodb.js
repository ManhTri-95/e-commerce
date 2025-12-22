'use strict';

const mongoose = require('mongoose');
const { countConnect } = require('../helpers/check.connect');
const { db } = require('../configs/config.mongodb');

const connectString = `mongodb://${db.host}:${db.port}/${db.name}`;
//console.log('connectString', connectString);
class Database { 
  constructor() {
    this.connect()
  }

  // connect
  connect(type = 'mongodb') {
    if (1 === 1) {
      mongoose.set('debug', true);
      mongoose.set ('debug', { color: true });
    }
    mongoose.connect(connectString, { maxPoolSize: 50 })
      .then(_ => countConnect()) 
      .catch(err => console.error('MongoDB connection error:', err));
  }

  static getInstance() { 
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }
}

const instanceMongoDB = Database.getInstance();

module.exports = instanceMongoDB;
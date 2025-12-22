'use strict'

// level 01
// const config = {
//   db: {
//     host: '127.0.0.1',
//     port: 27017,
//     dbName: 'shopDEV',
//   },
//   app: {
//     port: 3000
//   }
// };

const dev = {
  db: {
    host: process.env.DEV_DB_HOST || '127.0.0.1',
    port: process.env.DEV_DB_PORT || 27017,
    name: process.env.DEV_DB_NAME || 'shopDEV',
  },
  app: {
    port: process.env.DEV_APP_PORT || 3055
  }
};

const pro = {
  db: {
    host: process.env.PRO_DB_HOST || '127.0.0.1',
    port: process.env.PRO_DB_PORT || 27017,
    name:process.env.PRO_DB_NAME || 'shopPRO',
  },
  app: {
    port: process.env.PRO_APP_PORT || 3000
  }
};

const config = { dev, pro };
const env = process.env.NODE_ENV || 'dev';

console.log(config[env], env);
module.exports = config[env];
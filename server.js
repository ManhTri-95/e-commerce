// Load environment variables
require('dotenv').config();
const app = require('./src/app');

// Select port based on NODE_ENV
const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'pro';
const PORT = isProd
  ? process.env.PROD_APP_PORT
  : process.env.DEV_APP_PORT || 3056;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown (optional)
// process.on('SIGINT', () => {
//   server.close(() => { console.log(`Exit Server Express`) });
//   // notify.send(ping ...)
// });

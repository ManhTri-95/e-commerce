'use trict';

const mongoose = require('mongoose');
const os = require('os');
const process = require('process');
const _SECONDS = 5000;

// count connect
const countConnect = () => {
  const numConnections = mongoose.connections.length;
  //console.log(`Number of mongoose connections: ${numConnections}`);
};


// check over load
const checkOverload = () => { 
  setInterval(() => {
    const numConnections = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;

    //console.log(`Actives connections: ${numConnections}`);
    //console.log((`Memory usage ${memoryUsage / 1024 /1024} MB`));
    // Example maximums number of connections based on CPU cores
    const maxConnections = numCores * 5;

    if (numConnections > maxConnections) { 
      //console.log('Connections overload detected!');
      // notify.send(...)
    }
    //console.log(`Mongoose Connections: ${numConnections}, CPU Cores: ${numCores}, Memory Usage (RSS): ${memoryUsage} bytes`);
  }, _SECONDS);
}

module.exports = {
  countConnect,
  checkOverload
}
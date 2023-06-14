const fs = require('fs');
const log = require("./log")

function load() {
    
        const data = fs.readFileSync('../version.json');
        const versionObject = JSON.parse(data);
        return versionObject.version;
      
}

module.exports = {
  load
}
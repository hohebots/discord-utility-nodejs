const fs = require('fs');
const log = require("./log")

function load() {
    try {
        const data = fs.readFileSync('version.json');
        const versionObject = JSON.parse(data);
        return versionObject.version;
      } catch (error) {
        log.error('Fehler beim Laden der Version:', error);
        return null;
    }
}

module.exports = {
  load
}
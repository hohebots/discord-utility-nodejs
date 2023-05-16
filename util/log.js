const clc = require("cli-color")
var moment = require('moment');

function info(message) {
    console.log(clc.greenBright("[" + moment().format('hh:mm:ss') + "] [INFO] " + message))
}

function warn(message) {
    console.log(clc.yellowBright("[" + moment().format('hh:mm:ss') + "] [WARNING] " + message))
}

function error(message) {
    console.log(clc.redBright("[" + moment().format('hh:mm:ss') + "] [ERROR] " + message))
}

module.exports = {
    info: info,
    warn: warn,
    error: error
}

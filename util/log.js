const clc = require("cli-color")

function info(message) {
    console.log(clc.greenBright("[INFO] " + message))
}

function warn(message) {
    console.log(clc.yellowBright("[WARNING] " + message))
}

function error(message) {
    console.log(clc.redBright("[ERROR] " + message))
}

module.exports = {
    info: info,
    warn: warn,
    error: error
}

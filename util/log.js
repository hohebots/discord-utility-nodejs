const clc = require("cli-color")
const adminLogInteractions = require("../modules/util/adminLogInteractions")
var moment = require('moment');

function info(message, adminRelevant = false) {
    if (adminRelevant) {
        adminLogInteractions.send("info", message)
    }
    console.log(clc.greenBright("[" + moment().format('hh:mm:ss') + "] [INFO] " + message))
}

function warn(message, adminRelevant = false) {
    if (adminRelevant) {
        adminLogInteractions.send("warn", message)
    }
    console.log(clc.yellowBright("[" + moment().format('hh:mm:ss') + "] [WARNING] " + message))
}

function error(message, adminRelevant = false) {
    if (adminRelevant) {
        adminLogInteractions.send("error", message)
    }
    console.log(clc.redBright("[" + moment().format('hh:mm:ss') + "] [ERROR] " + message))
}

module.exports = {
    info,
    warn,
    error
}

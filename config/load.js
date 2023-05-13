const toml = require('@iarna/toml')
var fs = require("fs")

async function load() {
    var data = await toml.parse(fs.readFileSync("config.toml"))
    return data
}

module.exports = {
    load: load
}
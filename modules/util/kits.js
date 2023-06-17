const log = require("../../util/log")
const Kit = require("../models/Kit")

async function find(id) {
    const kit = await Kit.findOne({id: id})
    return kit
}

async function getAll() {
    const kits = await Kit.find()
    return kits
}


module.exports = {
    find,
    getAll
}
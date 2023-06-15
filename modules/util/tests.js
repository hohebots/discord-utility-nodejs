const log = require("../../util/log")
const Test = require("../models/Test")

async function find(userId, kitId) {
    const test = await Test.findOne({user: userId, kit: kitId})
    return test
}

async function getAll() {
    const tests = await Test.find()
    return tests
}


module.exports = {
    find,
    getAll
}
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

async function create(moduleId, user, kit, estimatedTier, ingameName) {
    if (await find(user, kit) == null) {
        const test = new Test({
            moduleId: moduleId,
            user: user,
            kit: kit,
            estimatedTier: estimatedTier,
            ingameName: ingameName,
            createdAt: Date.now()})
            test.save().then(() => log.info("MongoDB: Test von " + user + " erstellt"))
        return true
    } else {
        log.warn("MongoDB: Test " + user + " konnte nicht erstellt werden. Existiert bereits")
        return false
    }
}


module.exports = {
    find,
    getAll,
    create
}
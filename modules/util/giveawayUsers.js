const log = require("../../util/log")
const GiveawayUser = require("../models/GiveawayUser")
const Kit = require("../models/Kit")

async function getAll() {
    const giveawayUser = await GiveawayUser.find()
    return giveawayUser
}

async function find(id) {
    const giveawayUser = await GiveawayUser.findOne({id: id})
    return giveawayUser
}

async function create(id) {
    if (await find(id) == null) {
        const giveawayUser = new GiveawayUser({id: id})
        await giveawayUser.save()
        log.info("MongoDB: giveawayUser " + id + " erstellt")
        return true
    } else {
        log.warn("MongoDB: giveawayUser " + id + " konnte nicht erstellt werden. Existiert bereits")
        return false
    }
}

module.exports = {
    create,
    getAll,
    find
}
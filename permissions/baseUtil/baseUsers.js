const User = require("../models/User");
const clientStorage = require("../../util/client")
const log = require("../../util/log")

async function initUser(uID) { // initialises a users database entry
    const client = clientStorage.getClientInstance()
    let user = await client.users.fetch(uID);
    await create(uID, user.username, [])
    const result = await find(uID)
    return result
}

async function create(id, name, userPermissions) {
    if (await find(id) == null) {
        const user = new User({id: id, name: name, permissions: userPermissions})
        user.save().then(() => log.info("MongoDB: Nutzer " + name + " gespeichert"))
    } else {
        log.warn("MongoDB: Nutzer " + name + " konnte nicht erstellt werden. Existiert bereits")
    }
}

async function find(id) { // returns user entry in db by userid
    const user = await User.findOne({id: id})
    return user
}

async function getAll() { // returns user entry in db by userid
    const users = await User.find()
    return users
}

module.exports = {
    initUser,
    create,
    find,
    getAll,
}
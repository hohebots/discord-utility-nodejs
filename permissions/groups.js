const mongoose = require("mongoose")
const log = require("../util/log")
const Group = require("./models/Group")

async function create(id, name, linkedDiscordGroup, permissions) {
    if (await find(id) == null) {
        const group = new Group({id: id, name: name, linkedDiscordGroup: linkedDiscordGroup, permissions: permissions})
        group.save().then(() => log.info("MongoDB: Gruppe " + name + " gespeichert"))
    } else {
        log.warn("MongoDB: Gruppe " + name + " konnte nicht erstellt werden. Existiert bereits")
    }
}

async function find(id) {
    const group = Group.findOne({id: id})
    return group
}

async function addPermission(gID, pID) {
    group = await find(gID)
    if (group.permissions == null) {
        log.error("MongoDB: Gruppe ist noch nicht bereit")
    }
    if (!group.permissions.includes(pID)){
        group.permissions.push(pID)
        await group.save()
    } else {
        log.warn("MongoDB: Gruppe " + group.name + " hat bereits Permission " + pID)
    }
    
}

module.exports = {
    create,
    find,
    addPermission
}
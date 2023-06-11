const mongoose = require("mongoose")
const log = require("../util/log")
const Group = require("./models/Group")

async function create(id, name, linkedDiscordRole, permissions) {
    if (await find(id) == null) {
        const group = new Group({id: id, name: name, linkedDiscordRole: linkedDiscordRole, permissions: permissions})
        group.save().then(() => log.info("MongoDB: Gruppe " + name + " gespeichert"))
        return true
    } else {
        log.warn("MongoDB: Gruppe " + name + " konnte nicht erstellt werden. Existiert bereits")
        return false
    }
}

async function deleteGroup(gID) {
    group = find(gID)
    if (group == null) {
        return false
    }
    await Group.findOneAndDelete({id: gID})
    log.info("MongoDB: Gruppe " + gID + " wurde gelöscht")
    return true
}

async function find(id) {
    const group = await Group.findOne({id: id})
    return group
}

async function addPermission(gID, pID) {
    group = await find(gID)
    if (group.permissions == null) {
        log.error("MongoDB: Gruppe ist noch nicht bereit")
        return false
    }
    if (!group.permissions.includes(pID)){
        group.permissions.push(pID)
        await group.save()
        return true
    } else {
        log.warn("MongoDB: Gruppe " + group.name + " hat bereits Permission " + pID)
        return false
    }
}

async function linkGroup(gID, rID) {
    group = await find(gID)

    if (group != undefined) {
        group.linkedDiscordRole = rID
        group.save()
        return true
    }
    log.warn("MongoDB: Gruppe " + group.name + " nicht gefunden" + pID)
    return false
}

async function rename(gID, name) {
    group = await find(gID)

    if (group != undefined) {
        group.name = name
        group.save()
        return true
    }
    log.warn("MongoDB: Gruppe " + group.name + " nicht gefunden" + pID)
    return false
}

async function unlinkGroup(gID) {
    group = await find(gID)

    if (group == undefined) {
        log.warn("MongoDB: Gruppe " + group.name + " nicht gefunden")
        return false
    }

    if (group.linkedDiscordRole == undefined) {
        log.warn("MongoDB: Gruppe " + group.name + " hat keine verbundene Rolle" )
        return false
    }

    group.linkedDiscordRole = undefined
    group.save()
    return true
}

async function removePermission(gID, pID) { // removes a permission from a user
    var group = await find(gID)
    if (group == null) {
        return false
    }
    if (group.permissions.includes(pID)){
        group.permissions = group.permissions.filter(item => item !== pID)
        await group.save()
        return true
    } else {
        log.warn("MongoDB: Gruppe hat nicht Permssion " + pID)
        return false
    }
}

async function getAll(id) {
    const groups = await Group.find()
    return groups
}

async function getLinkedGroup(linkedDiscordRoleId) {
    const group = await Group.findOne({linkedDiscordRole: linkedDiscordRoleId})
    return group
}

module.exports = {
    create,
    find,
    getAll,
    addPermission,
    getLinkedGroup,
    deleteGroup,
    removePermission,
    linkGroup,
    unlinkGroup,
    rename
}
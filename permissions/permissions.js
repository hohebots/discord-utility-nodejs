const mongoose = require("mongoose")
const log = require("../util/log")
const Permission = require("./models/Permission")
const users = require("./users")
const groups = require("./groups")
const config = require("../config/load")

async function create(id, name, description) {
    if (await find(id) == null) {
        const permission = new Permission({id: id, name: name, description: description})
        permission.save().then(() => log.info("MongoDB: Permission " + name + " gespeichert"))
    } else {
        log.warn("MongoDB: Permission " + name + " konnte nicht erstellt werden. Existiert bereits")
    }
}

async function find(id) {
    const permission = await Permission.findOne({id: id})
    return permission
}

async function getAll(id) {
    const permission = await Permission.find()
    return permission
}

async function initPresetPermissions() {
    conf = await config.load()
    permissions = conf.permissions
    Object.keys(permissions).forEach(function(permission) {
        create(permissions[permission].id, permissions[permission].name, permissions[permission].description)
    })
} 

async function check(uID, permissions) {
    if (permissions == null) { // returns true if the command does not require any permissions
        return true
    }

    var hasPermissions = true
    userPermissions = await users.getPermisisons(uID)
    permissions.forEach(function (permission, index) {
        if (!userPermissions.includes(permission)) {
            hasPermissions = false
        }
    });

    return hasPermissions
}

async function getCommandPermissions(commandName) {
    conf = await config.load()
    commandPermissions = conf.commands[commandName].requiredPermissions
    if (commandPermissions == undefined) {
        return null
    } else {
        return commandPermissions
    }
}

module.exports = {
    initPresetPermissions,
    create,
    find,
    check,
    getCommandPermissions,
    getAll
}
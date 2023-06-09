const mongoose = require("mongoose")
const log = require("../util/log")
const Permission = require("./models/Permission")
const users = require("./users")
const clientStorage = require("../util/client")
const config = require("../util/config")
const { commands } = require("../commands/deploy")
const baseUserUtil = require("./baseUtil/baseUsers")

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
    if (permissions == null) { // returns true if no permissions are required
        return true
    }

    var hasPermissions = true
    userPermissions = await users.getPermisisons(uID)

    if (userPermissions.includes("admin")) { // returns true if user has admin permissionso
        return true
    }

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
    if (commandPermissions == undefined) { // this case will never happen due to the bot crashing whenever an undefined command is called. todo: use try catch/detect if the command itself is undefined rather than this
        return null
    } else {
        return commandPermissions
    }
}

async function getPermittedUsers(perms) {
    client = clientStorage.getClientInstance()
    conf = await config.load()
    guildId = conf.settings.auth.guildId
    guild = client.guilds.cache.get(guildId)
    allUsers = await baseUserUtil.getAll()
    permittedUsers = [] 
    
    for (user of allUsers) {
        try {
            hasPermissions = await check(user.id, perms)
            if (hasPermissions) {
                permittedUsers.push(user.id)
            }
        } catch {
            log.warn("Nutzer " + user.name + " nicht vorhanden")
        }
    }
    return permittedUsers
} 

module.exports = {
    initPresetPermissions,
    create,
    find,
    check,
    getCommandPermissions,
    getAll,
    getPermittedUsers
}
const mongoose = require("mongoose")
const log = require("../util/log")
const groups = require("./groups")
const config = require("../util/config")
const User = require("./models/User")
const { Client } = require("discord.js")
const clientStorage = require("../util/client")

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



async function getPermisisons(uID) { // returns list of a given users permissions

    conf = await config.load()
    user = await find(uID)
    if (user == null) {
        user = await initUser(uID)
    }

    await resyncRoles(uID) // resynchronizes all groups and their link discord roles
    
    var userPermissions = []

    for (const userPermission of user["permissions"]) {
        userPermissions.push(userPermission)
    }
    
    try {
        for (const group of user.groups) {
            userGroup = await groups.find(group)
            if (userGroup == null) {
                const index = user.groups.indexOf(group);
                if (index > -1) { // only splice array when item is found
                    user.groups.splice(index, 1); // 2nd parameter means remove one item only
                }
                user.save()

            } else {
                for (const groupPermission of userGroup["permissions"]) {
                    userPermissions.push(groupPermission)
                }
            }
            
        }
        
    } catch (e) {
        log.error("MongoDB: " + e)
    }
    return userPermissions


}

async function addGroup(uID, gID) { // adds a user to a group

    var user = await find(uID)
    if (user == null) {
        await initUser(uID)
        user = await find(uID)
    }
    if (!user.groups.includes(gID)){
        user.groups.push(gID)
        await user.save()
    } else {
        log.warn("MongoDB: Nutzer ist bereits in Gruppe " + gID)
    }
}

async function addPermission(uID, pID) { // adds a user to a group

    var user = await find(uID)
    if (!user) {
        await initUser(uID)
        user = await find(uID)
        console.log(user)
        user.permissions.push(pID)
        await user.save()
        return true
    }
    if (user.permissions.includes(pID)){
        log.warn("MongoDB: Nutzer hat bereits Permission " + pID)
        return false
    }
    user.permissions.push(pID)
    await user.save()
    return true
}

async function removeGroup(uID, gID) { // removes a user from a group
    var user = await find(uID)
    if (user == null) {
        await initUser(uID)
        user = await find(uID)
        return
    }
    if (user.groups.includes(gID)){
        user.groups = user.groups.filter(item => item !== gID)
        await user.save()
    } else {
        log.warn("MongoDB: Nutzer ist nicht in Gruppe " + gID)
    }
}

async function resyncRoles(uID) {
    await addDeSyncedGroups(uID)
    await removeDesyncedGroups(uID)
}

async function removeDesyncedGroups(uID) { // adds all groups linked to members roles if not present
    try {
        conf = await config.load()
        user = await find(uID)
        if (user == null) {
            user = await initUser(uID)
        }
        guildId = conf.settings.auth.guildId 

        const client = clientStorage.getClientInstance()
        const guild = await client.guilds.fetch(guildId)
        const member = await guild.members.fetch(user.id)
        const roleIds = member._roles
        for (const userGroupId of user.groups) {
            userGroup = await groups.find(userGroupId)
            linkedRole = userGroup.linkedDiscordRole
            if (!roleIds.includes(linkedRole) && linkedRole != undefined) {
                await removeGroup(uID, userGroupId)
            }
        
    }
    } catch (e) {
        log.warn("Nutzer nicht gefunden/keine verbundenen Rollen erkannt. " + e)
        return null
    }
    
}

async function addDeSyncedGroups(uID) {
    try {
        conf = await config.load()
        user = await find(uID)
        if (user == null) {
            user = await initUser(uID)
        }
        guildId = conf.settings.auth.guildId 

        const client = clientStorage.getClientInstance()
        const guild = await client.guilds.fetch(guildId)
        const member = await guild.members.fetch(user.id)
        const roleIds = member._roles

        for (const roleId of roleIds) {
                
            linkedGroup = await groups.getLinkedGroup(roleId)
            if (linkedGroup != null) {
                await addGroup(uID, linkedGroup.id)
            }
        
        }
    } catch (e) {
        log.warn("Nutzer nicht gefunden/keine verbundenen Rollen erkannt." + e)
        return null
    }
}

async function initUser(uID) { // initialises a users database entry
    const client = clientStorage.getClientInstance()
    let user = await client.users.fetch(uID);
    await create(uID, user.username, [])
    const result = await find(uID)
    return result
}

module.exports = {
    create,
    find,
    getPermisisons,
    addGroup,
    addPermission,
    getAll
}
const mongoose = require("mongoose")
const log = require("../util/log")
const groups = require("./groups")
const User = require("./models/User")
const { Client } = require("discord.js")
const clientStorage = require("../util/client")

async function create(id, name, permissions) {
    if (await find(id) == null) {
        const user = new User({id: id, name: name, permissions: permissions})
        user.save().then(() => log.info("MongoDB: Nutzer " + name + " gespeichert"))
    } else {
        log.warn("MongoDB: Nutzer " + name + " konnte nicht erstellt werden. Existiert bereits")
    }
}

async function find(id) {
    const user = await User.findOne({id: id})
    return user
}

async function getPermisisons(uID) {

    // add checking for linkedDiscordRole

    user = await find(uID)
    var userPermissions = []

    if (user == null) {
        return []
    } else {
        var userPermissions = user["permissions"]
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

}

async function addGroup(uID, gID) {
    var member = await find(uID)
    if (member == null) {
        await initMember(uID)
        member = await find(uID)
    }
    if (!member.groups.includes(gID)){
        member.groups.push(gID)
        await member.save()
    } else {
        log.warn("MongoDB: Nutzer ist bereits in Gruppe " + gID)
    }
    
}

async function initMember(uID) {
    const client = clientStorage.getClientInstance()
    let user = await client.users.fetch(uID);
    await create(uID, user.username, [])
    const member = await find(uID)
    return member
}

module.exports = {
    create,
    find,
    getPermisisons,
    addGroup
}
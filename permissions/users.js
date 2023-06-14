const mongoose = require("mongoose")
const log = require("../util/log")
const groups = require("./groups")
const config = require("../util/config")
const User = require("./models/User")
const { Client } = require("discord.js")
const clientStorage = require("../util/client")
const baseUserUtil = require("./baseUtil/baseUsers")

async function getPermisisons(uID) { // returns list of a given users permissions

    await resyncRoles(uID) // resynchronizes all groups and their link discord roles
    
    conf = await config.load()
    user = await baseUserUtil.find(uID)
    if (user == null) {
        user = await baseUserUtil.initUser(uID)
    }

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
    var user = await baseUserUtil.find(uID)
    var group = await groups.find(gID)
    if (!user) {
        await baseUserUtil.initUser(uID)
        user = await baseUserUtil.find(uID)
    }
    if (!group) {
        log.warn("MongoDB: Gruppe " + gID + " existiert nicht")
        return false
    }
    if (!user.groups.includes(gID)){
        user.groups.push(gID)
        await user.save()
        return true
    } else {
        log.warn("MongoDB: Nutzer ist bereits in Gruppe " + gID)
        return false
    }
}

async function addPermission(uID, pID) { // adds a permission to a user

    var user = await baseUserUtil.find(uID)
    if (!user) {
        await baseUserUtil.initUser(uID)
        user = await baseUserUtil.find(uID)
    }
    if (!user.permissions.includes(pID)){
        user.permissions.push(pID)
        await user.save()
        return true
    } else {
        log.warn("MongoDB: Nutzer hat bereits Permission " + pID)
        return false
    }
    
}

async function removePermission(uID, pID) { // removes a permission from a user
    var user = await baseUserUtil.find(uID)
    if (user == null) {
        await baseUserUtil.initUser(uID)
        user = await baseUserUtil.find(uID)
        return false
    }
    if (user.permissions.includes(pID)){
        user.permissions = user.permissions.filter(item => item !== pID)
        await user.save()
        return true
    } else {
        log.warn("MongoDB: Nutzer hat nicht Permssion " + pID)
        return false
    }
}

async function removeGroup(uID, gID) { // removes a user from a group
    var user = await baseUserUtil.find(uID)
    if (user == null) {
        await baseUserUtil.initUser(uID)
        user = await baseUserUtil.find(uID)
    }
    if (user.groups.includes(gID)){
        user.groups = user.groups.filter(item => item !== gID)
        await user.save()
        return true
    } else {
        log.warn("MongoDB: Nutzer ist nicht in Gruppe " + gID)
        return false
    }
}

async function resyncRoles(uID) {
    await addDeSyncedGroups(uID)
    await removeDesyncedGroups(uID)
}

async function removeDesyncedGroups(uID) { // adds all groups linked to members roles if not present
    try {
        conf = await config.load()
        user = await baseUserUtil.find(uID)
        if (user == null) {
            user = await baseUserUtil.initUser(uID)
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
        user = await baseUserUtil.find(uID)
        if (user == null) {
            user = await baseUserUtil.initUser(uID)
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



module.exports = {
    getPermisisons,
    addGroup,
    addPermission,
    removePermission,
    removeGroup
}
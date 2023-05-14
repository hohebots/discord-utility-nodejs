const mongoose = require("mongoose")
const log = require("../util/log")
const groups = require("./groups")
const User = require("./models/User")
const { Client } = require("discord.js")

async function create(id, name, permissions) {
    if (await find(id) == null) {
        const user = new User({id: id, name: name, permissions: permissions})
        user.save().then(() => log.info("MongoDB: Nutzer " + name + " gespeichert"))
    } else {
        log.warn("MongoDB: Nutzer " + name + " konnte nicht erstellt werden. Existiert bereits")
    }
}

async function find(id) {
    const user = User.findOne({id: id})
    return user
}

async function getPermisisons(uID) {
    user = await find(uID)
    group = await groups.find("")
    if (user == null) {
        return []
    } else {
        return user["permissions"]
    }

    // todo: implement groups
}

async function addGroup(uID, gID) {
    member = await find(uID)
    if (member == null) {
        initMember(uID)
    }
    if (!member.groups.includes(gID)){
        member.groups.push(gID)
        await member.save()
    } else {
        log.warn("MongoDB: Nutzer ist bereits in Gruppe " + gID)
    }
    
}

async function initMember(uID) {
    let user = Client.users.fetch(uID);
    // kommt noch
}

module.exports = {
    create,
    find,
    getPermisisons,
    addGroup
}
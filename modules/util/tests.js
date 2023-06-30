const clientStorage = require("../../util/client")
const log = require("../../util/log")
const modules = require("./modules")
const kits = require("./kits")
const Test = require("../models/Test")
const randomstring = require("randomstring")
const { ChannelType, PermissionsBitField } = require("discord.js")
const { EmbedBuilder } = require("@discordjs/builders")

async function find(userId, kitId, moduleId) {
    const test = await Test.findOne({user: userId, kit: kitId, moduleId: moduleId})
    return test
}

async function findUserTests(userId) {
    const tests = await Test.find({user: userId})
    return tests
}

async function deleteOne(testId) {
    const test = await Test.findOneAndDelete({id: testId})
    return test
}

async function get(id) {
    const test = await Test.findOne({id: id})
    return test
}

async function deny(id) {
    const test = await get(id)
    test.completedAt = Date.now()
    test.state = "closed"
    test.save()
    return test
}

async function getAll() {
    const tests = await Test.find()
    return tests
}

async function getAllInactive() {
    const tests = await Test.find({state: "inactive"})
    return tests
}

async function create(moduleId, user, kit, estimatedTier, ingameName) {
    testId = randomstring.generate(10)
    const test = new Test({
        moduleId: moduleId,
        user: user,
        kit: kit,
        state: "inactive",
        estimatedTier: estimatedTier,
        testChannel: "0",
        ingameName: ingameName,
        createdAt: Date.now(),
        id: testId,
        completedAt: "0",
        finalTier: "0",
        positionDM: "0"})
        
        test.save().then(() => log.info("MongoDB: Test von " + user + " erstellt"))
    return true
}

async function alreadyExists(testId) {
    const test = await get(testId)
    if (test.state == "closed") {
        if (test.completedAt == "0") {
            return true
        }
        currentDate = Date.now()
        timeSinceCompletion = currentDate - parseInt(test.completedAt, 10)
        thirtyDays = 1000 * 60 * 60 * 24 * 30
        if (timeSinceCompletion >= thirtyDays) {
            await deleteOne(testId)
            return false            
        }
    } 
    return true
}

async function createTestChannel(testId, guild, testerId) {
    client = clientStorage.getClientInstance()
    test = await get(testId)
    module = await modules.find(test.moduleId)
    tierlistCategory = module.category
    testUser = await client.users.fetch(test.user)
    testerUser = await client.users.fetch(testerId)

    testChannel = await guild.channels.create({
        name: test.kit + " " + testerUser.username + " " + testUser.username,
        type: ChannelType.GuildText,
        parent: tierlistCategory,
        permissionOverwrites: [
            {
                id: guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
                
            },
            {
                id: testUser.id,
                allow: [PermissionsBitField.Flags.ViewChannel],
            },
            {
                id: testerUser.id,
                allow: [PermissionsBitField.Flags.ViewChannel],
            }
        ]
    })
    await setTestChannel(testId, testChannel.id)
    await setTester(testId, testerId)
    return testChannel
}

async function setTestChannel(testId, testChannelId) {
    test = await get(testId)
    test.testChannel = testChannelId
    test.save()
}

async function setPositionDM(testId, positionDM) {
    test = await get(testId)
    test.positionDM = positionDM
    test.save()
}

async function setTester(testId, testerId) {
    test = await get(testId)
    test.tester = testerId
    test.save()
}

async function switchTester(guild, testId, newTesterId) {
    test = await get(testId)
    oldTesterId = test.tester
    testChannel = await guild.channels.fetch(test.testChannel)
    testChannel.permissionOverwrites.set([
        {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
            
        },
        {
            id: newTesterId,
            allow: [PermissionsBitField.Flags.ViewChannel],
        },
        {
            id: test.user,
            allow: [PermissionsBitField.Flags.ViewChannel],
        }
    ])
    setTester(testId, newTesterId)
}

async function setState(testId, state) {
    test = await get(testId)
    test.state = state
    test.save()
}

async function setCompleted(testId) {
    test = await get(testId)
    test.completedAt = Date.now()
    test.save()
}

async function setFinalTier(testId, tier) {
    test = await get(testId)
    test.finalTier = tier
    test.save()
}

async function sendPositionChange(testId, moduleId) {
    client = clientStorage.getClientInstance()
    test = await get(testId)
    kit = await kits.find(test.kit)
    orderedTests = await Test.find({ state: "inactive", moduleId: moduleId}).sort({ createdAt: 1 })
    var position = 0
    for (let i = 0; i < orderedTests.length; i++) {
        console.log(orderedTests[i])
        if (orderedTests[i].id == testId) {
            log.info("Test zum editieren der positionDM gefunden! " + i)
            position = i
            break 
        }
    }
    if (test.positionDM == "0") {
        return
    }
    testUser = await client.users.fetch(test.user)
    testUserChannel = testUser.dmChannel
    positionDM = await testUserChannel.messages.fetch(test.positionDM)
    
    const positionDMModal = new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle('Du bist nun in der Tierlist-Warteschlange!')
        .addFields({ 
            name: 'Position in der Warteschlange:',
            value: position.toString()})
        .addFields({ 
            name: 'Kit:',
            value: kit.name})
        .setAuthor({ name: 'Tierlist', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
    
    positionDM.edit({embeds: [positionDMModal]})
}

async function checkTierValidity(tier) {
    valid = ["ht1", "ht2", "ht3", "ht4", "ht5", "lt1", "lt2", "lt3", "lt4", "lt5", "s+", "a+", "b+", "c+", "d+", "e+", "f+", "so", "ao", "bo", "co", "do", "eo", "fo", "s-", "a-", "b-", "c-", "d-", "e-", "f-", "a", "b", "c", "d", "e", "f"]
    if (valid.includes(tier.toLowerCase())) {
        return true
    } else {
        return false
    }
}


module.exports = {
    find,
    getAll,
    create,
    get,
    deny,
    alreadyExists,
    setTester,
    createTestChannel,
    setState,
    setFinalTier,
    setCompleted,
    switchTester,
    setPositionDM,
    sendPositionChange,
    getAllInactive,
    findUserTests,
    deleteOne,
    checkTierValidity
}
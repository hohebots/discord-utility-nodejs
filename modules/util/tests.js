const clientStorage = require("../../util/client")
const log = require("../../util/log")
const modules = require("./modules")
const Test = require("../models/Test")
const randomstring = require("randomstring")
const { ChannelType, PermissionsBitField } = require("discord.js")

async function find(userId, kitId, moduleId) {
    const test = await Test.findOne({user: userId, kit: kitId, moduleId: moduleId})
    return test
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
        finalTier: ""})
        
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
    switchTester
}
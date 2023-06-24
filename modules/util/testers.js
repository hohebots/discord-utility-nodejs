const log = require("../../util/log")
const Kit = require("../models/Kit")
const Tester = require("../models/Tester")

async function find(id) {
    const tester = await Tester.findOne({id: id})
    return tester
}

async function getAll() {
    const testers = await Tester.find()
    return testers
}

async function incrementPoints(id) {
    const tester = await find(id)
    testPoints = parseInt(tester.testPoints, 10) + 1
    tester.testPoints = testPoints.toString()
    tester.save()
}

async function getTier(user, kit) {
    const tester = await find(user)
    for (tier of tester.tier) {
        if (tier[0] == kit) {
            return tier[1]
        }
    }
    return false
}

async function getKit(kit) {
    const testers = await getAll()
    kitTesters = []
    for (tester of testers) {
        for (tier of tester.tier) {
            if (tier[0] == kit) {
                kitTesters.push(tester)
            }
        }
    }
    return kitTesters
}

module.exports = {
    find,
    getAll,
    getKit,
    getTier,
    incrementPoints
}
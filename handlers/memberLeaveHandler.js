const ticketHandler = require('../modules/handlers/ticketHandler.js');
const tierlistHandler = require('../modules/handlers/tierlistHandler.js');
const adminLogHandler = require('../modules/handlers/adminLogHandler.js');
const tests = require('../modules/util/tests.js');
const testAcceptionChannels = require('../modules/util/testAcceptionChannels.js');
const modules = require('../modules/util/modules.js');
const clientStorage = require('../util/client.js');
const { EmbedBuilder } = require('@discordjs/builders');


async function handle(member) {
    client = clientStorage.getClientInstance()
    userId = member.user.id
    userTests = await tests.findUserTests(userId)
    if (userTests != []) {
        for (test of userTests) {
            tests.deleteOne(test.id)
        }
        for (module of await modules.getAll()) {
            if (module.type == "tierlist") {
                testAcceptionChannels.updateAcceptMessage(module.id)
            }
        }
    }   
}

module.exports = {
    handle: handle
}
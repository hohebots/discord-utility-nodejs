const modules = require("../modules/util/modules")
const ticketHandler = require('../modules/handlers/ticketHandler.js');
const tierlistHandler = require('../modules/handlers/tierlistHandler.js');

async function handle(interaction) {
    const potentialModule = await modules.find(interaction.customId) // gets the module from which the request was sent, if is a module at all

    if (potentialModule != null) {
        if (potentialModule.type == "tickets"){
            await ticketHandler.initTicket(interaction, potentialModule)
        } else if (potentialModule.type == "tierlist"){
            await tierlistHandler.initTest(interaction, potentialModule)
        }
    }
}

module.exports = {
    handle: handle
}


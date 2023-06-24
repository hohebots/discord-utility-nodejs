const ticketHandler = require('../modules/handlers/ticketHandler.js');
const tierlistHandler = require('../modules/handlers/tierlistHandler.js');
const giveawayHandler = require('../modules/handlers/giveawayHandler.js');


async function handle(interaction) {
    buttonResponse = interaction.customId.split("-")
    action = buttonResponse[0]
    if (action == "closeTicket") {
        await ticketHandler.closeTicket(buttonResponse, interaction)
    } else if (action == "claimTicket") {
        await ticketHandler.claimTicket(buttonResponse, interaction)
    } else if (action == "joinGiveaway") {
        await giveawayHandler.addUser(interaction)
    } else if (action == "denyTest") {
        await tierlistHandler.denyTest(interaction)
    } else if (action == "acceptTest") {
        await tierlistHandler.acceptTest(interaction)
    } else if (action == "finishTest") {
        await tierlistHandler.finishTest(interaction)
    } else if (action == "rejectTest") {
        await tierlistHandler.rejectTest(interaction)
    } else if (action == "repeatTest") {
        await tierlistHandler.repeatTest(interaction)
    } else if (action == "switchTester") {
        await tierlistHandler.switchTester(interaction)
    }

}

module.exports = {
    handle
}
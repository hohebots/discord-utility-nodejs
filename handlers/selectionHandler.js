const modules = require("../modules/util/modules")
const ticketHandler = require('../modules/handlers/ticketHandler.js');
const tierlistHandler = require('../modules/handlers/tierlistHandler.js');

async function handle(interaction) {
    selectionResponse = interaction.customId.split("-")
    interactionModule = await modules.find(selectionResponse[0])
    action = selectionResponse[1]
    console.log(selectionResponse)

    if (interactionModule != null) {
        if (interactionModule.type == "tickets"){
            if (action == "createTicket") {
                await ticketHandler.initTicket(interaction, interactionModule)
            }
        } else if (interactionModule.type == "tierlist"){
            if (action == "joinWaitlist") {
                await tierlistHandler.initTest(interaction, interactionModule)
            } else if (action == "acceptTest") {
                await tierlistHandler.showTestOptions(interaction, interactionModule)
            } else if (action == "setTester") {
                await tierlistHandler.setTester(interaction, interactionModule)
            }
            
        } 
    }
}

module.exports = {
    handle: handle
}


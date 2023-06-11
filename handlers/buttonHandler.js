const ticketHandler = require('../modules/handlers/ticketHandler.js');

async function handle(interaction) {
    buttonResponse = interaction.customId.split("-")
    action = buttonResponse[0]
    
    if (action == "closeTicket") {
        await ticketHandler.closeTicket(buttonResponse, interaction)

    } else if (action == "claimTicket") {
        await ticketHandler.claimTicket(buttonResponse, interaction)
    }

}

module.exports = {
    handle
}
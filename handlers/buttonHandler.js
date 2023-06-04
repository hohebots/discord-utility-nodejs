const tickets = require("../modules/tickets")

async function handle(interaction) {
    buttonResponse = interaction.customId.split("-")
    action = buttonResponse[0]
    
    if (action == "closeTicket") {
        tickets.closeTicket(buttonResponse, interaction)

    } else if (action == "claimTicket") {
        tickets.claimTicket(buttonResponse, interaction)
    }

}

module.exports = {
    handle
}
const tickets = require("../modules/tickets");
const moduleUtil = require("../modules/database")

async function handle(interaction) {
    modalResponse = interaction.customId.split("-")
    action = modalResponse[0]
    if (interaction.customId == "ticketBoothCreationModal") {
        if (tickets.setup(interaction)) {
            await interaction.reply({ content: 'Modul wurde erstellt' });
        } else {
            await interaction.reply({ content: 'Fehler beim Erstellen des Moduls'});
        }        
    } else if (action == "createTicket") {
        await tickets.createTicket(interaction, modalResponse, interaction.fields)     
    }
}

module.exports = {
    handle: handle
}
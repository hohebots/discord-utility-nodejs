const ticketHandler = require('../modules/handlers/ticketHandler.js');

async function handle(interaction) {
    modalResponse = interaction.customId.split("-")
    action = modalResponse[0]
    if (interaction.customId == "ticketBoothCreationModal") {
        if (ticketHandler.setup(interaction)) {
            await interaction.editReply({ content: 'Modul wurde erstellt' });
        } else {
            await interaction.editReply({ content: 'Fehler beim Erstellen des Moduls'});
        }        
    } else if (action == "createTicket") {
        await ticketHandler.createTicket(interaction, modalResponse, interaction.fields)     
    }
}

module.exports = {
    handle: handle
}
const ticketHandler = require('../modules/handlers/ticketHandler.js');
const adminLogHandler = require('../modules/handlers/adminLogHandler.js');


async function handle(interaction) {
    modalResponse = interaction.customId.split("-")
    action = modalResponse[0]
    if (interaction.customId == "ticketBoothCreationModal") {
        if (await ticketHandler.setup(interaction)) {
            await interaction.editReply({ content: 'Modul wurde erstellt' , ephemeral: true});
        } else {
            await interaction.editReply({ content: 'Fehler beim Erstellen des Moduls', ephemeral: true});
        }        
    } else if (interaction.customId == "adminLogCreationModal") {
        if (await adminLogHandler.setup(interaction)) {
            await interaction.editReply({ content: 'Modul wurde erstellt', ephemeral: true});
        } else {
            await interaction.editReply({ content: 'Fehler beim Erstellen des Moduls', ephemeral: true});
        }
        
    } else if (action == "createTicket") {
        await ticketHandler.createTicket(interaction, modalResponse, interaction.fields)     
    }
}


module.exports = {
    handle: handle
}
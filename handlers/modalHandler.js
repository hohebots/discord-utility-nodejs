const tickets = require("../modules/tickets");


async function handle(interaction) {

    if (interaction.customId == "ticketBoothCreationModal") {
        if (tickets.setup(interaction)) {
            await interaction.reply({ content: 'Modul wurde erstellt' });
        } else {
            await interaction.reply({ content: 'Fehler beim Erstellen des Moduls'});
        }        
    }
}

module.exports = {
    handle: handle
}
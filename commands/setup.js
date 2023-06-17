const { ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { SelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('@discordjs/builders');
const permissions = require('../permissions/permissions.js');
const log = require('../util/log.js');
const randomstring = require('randomstring');

async function run(interaction) {
    if (interaction.options.getSubcommand() == "create") {
        const module = interaction.options.getString("moduletype")
        if (module == "tickets") {
            const ticketBoothCreationModal = new ModalBuilder()
                .setCustomId('ticketBoothCreationModal')
                .setTitle('Ticketsystem erstellen');
            
            const ticketBoothName = new TextInputBuilder()
                .setCustomId('name')
                .setLabel("Name")
                .setStyle(TextInputStyle.Short);

            row = new ActionRowBuilder().addComponents(ticketBoothName)
            ticketBoothCreationModal.addComponents(row)
            
            await interaction.showModal(ticketBoothCreationModal)
        } else if (module == "adminLog") {
            const adminLogCreationModal = new ModalBuilder()
                .setCustomId('adminLogCreationModal')
                .setTitle('Admin Log erstellen');
            
            const adminLogName = new TextInputBuilder()
                .setCustomId('name')
                .setLabel("Name")
                .setStyle(TextInputStyle.Short);

            row = new ActionRowBuilder().addComponents(adminLogName)
            adminLogCreationModal.addComponents(row)
            
            await interaction.showModal(adminLogCreationModal)
        }
    }
}

module.exports = {
    run: run
}
const { ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { SelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('@discordjs/builders');

async function run(client, interaction) {
    await interaction.reply('Bong!');
}


module.exports = {
    run: run
}


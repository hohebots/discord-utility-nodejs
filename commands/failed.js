const { EmbedBuilder } = require("@discordjs/builders");
const groups = require("../permissions/groups.js")
const users = require("../permissions/users.js")

async function run(interaction, e) {
    const command = interaction.commandName;
    const commandFailedEmbed = new EmbedBuilder()
        .setColor(0xED4245) // discord red
        .setTitle("Command " + command + " konnte nicht ausgeführt werden.")
        .setAuthor({ name: 'Fehler', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
        .setDescription('Dieser Command konnte aufgrund eines Internen Fehlers nicht ausgeführt werden. Falls dieser Fehler wiederholt auftritt, kontaktiere mths#3066. Fehlercode: '+e.name)

    await interaction.reply({ embeds: [commandFailedEmbed], ephemeral: true})
}

module.exports = {
    run: run
}
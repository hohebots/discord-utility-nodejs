const { EmbedBuilder } = require("@discordjs/builders");
const groups = require("../permissions/groups.js")
const users = require("../permissions/users.js")

async function run(interaction) {
    
    const missingPermissionsEmbed = new EmbedBuilder()
        .setColor(0xED4245) // discord red
        .setTitle('Fehlende Berechtigungen')
        .setAuthor({ name: 'Fehler', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
        .setDescription('Du hast keine Berechtigungen um dies zu tun.')

    await interaction.reply({ embeds: [missingPermissionsEmbed], ephemeral: true})
}

module.exports = {
    run: run
}
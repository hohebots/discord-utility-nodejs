const { EmbedBuilder } = require("@discordjs/builders");
const groups = require("../permissions/groups.js")
const users = require("../permissions/users.js")
const casd = require("../util/client.js")


async function run(client, interaction) {
    
    const missingPermissionsEmbed = new EmbedBuilder()
        .setColor(0xED4245) // discord red
        .setTitle('Fehlende Berechtigungen')
        .setAuthor({ name: 'Fehler', iconURL: 'https://i.imgur.com/681yPtc.png'})
        .setDescription('Du hast keine Berechtigungen diesen Command auszuführen.')

    await interaction.reply({ embeds: [missingPermissionsEmbed], ephemeral: true})
}

module.exports = {
    run: run
}
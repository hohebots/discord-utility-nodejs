const { EmbedBuilder } = require("@discordjs/builders");

async function run(interaction) {
    
    const missingPermissionsEmbed = new EmbedBuilder()
        .setColor(0xED4245) // discord red
        .setTitle('Kein Modul gefunden')
        .setAuthor({ name: 'Fehler', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
        .setDescription('Kein Modul dieser Art existiert.')

    await interaction.editReply({ embeds: [missingPermissionsEmbed], ephemeral: true})
}

module.exports = {
    run: run
}
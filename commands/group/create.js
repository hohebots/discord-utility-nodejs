const users = require("../../permissions/users.js")
const groups = require("../../permissions/groups.js")
const { EmbedBuilder } = require("@discordjs/builders")

async function run(interaction) {
    const id = interaction.options.getString("id")
    const name = interaction.options.getString("name")
    if (await groups.create(id, name, undefined, []) == true) {
        const interactionSuccessEmbed = new EmbedBuilder()
            .setColor(0x57F287) // discord green
            .setTitle('Gruppe ' + id + ' erstellt')
            .setAuthor({ name: 'Gruppen', iconURL: 'https://i.imgur.com/pKsq653.png'})
        await interaction.reply({ embeds: [interactionSuccessEmbed], ephemeral: true})
    } else {
        const interactionFailEmbed = new EmbedBuilder()
            .setColor(0xED4245) // discord red
            .setTitle('Fehlgeschlagen')
            .setAuthor({ name: 'Gruppen', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
            .setDescription("Gruppe " + id + " existiert bereits")
        await interaction.reply({ embeds: [interactionFailEmbed], ephemeral: true})
    }
}

module.exports = {
    run
}
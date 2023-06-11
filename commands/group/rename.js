const groups = require("../../permissions/groups.js")
const { EmbedBuilder } = require("@discordjs/builders")

async function run(interaction) {
    const group = interaction.options.getString("group")
    const name = interaction.options.getString("name")

    if (await groups.rename(group, name) == true) {
        const interactionSuccessEmbed = new EmbedBuilder()
            .setColor(0x57F287) // discord green
            .setTitle('Gruppe ' + group + ' wurde umbenannt')
            .setAuthor({ name: 'Gruppen', iconURL: 'https://i.imgur.com/pKsq653.png'})
        await interaction.editReply({ embeds: [interactionSuccessEmbed], ephemeral: true})
    } else {
        const interactionFailEmbed = new EmbedBuilder()
            .setColor(0xED4245) // discord red
            .setTitle('Fehlgeschlagen')
            .setAuthor({ name: 'Gruppen', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
            .setDescription("Gruppe " + group + " existiert nicht")
        await interaction.editReply({ embeds: [interactionFailEmbed], ephemeral: true})
    }
}

module.exports = {
    run
}
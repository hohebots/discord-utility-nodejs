const users = require("../../permissions/users.js")
const groups = require("../../permissions/groups.js")
const { EmbedBuilder } = require("@discordjs/builders")

async function run(interaction) {
    const id = interaction.options.getString("group")

    if (await groups.deleteGroup(id) == true) {
        const interactionSuccessEmbed = new EmbedBuilder()
            .setColor(0x57F287) // discord green
            .setTitle('Gruppe '+ id +' gelöscht')
            .setAuthor({ name: 'Gruppen', iconURL: 'https://i.imgur.com/pKsq653.png'})
        await interaction.editReply({ embeds: [interactionSuccessEmbed], ephemeral: true})
    } else {
        const interactionFailEmbed = new EmbedBuilder()
            .setColor(0xED4245) // discord red
            .setTitle('Fehlgeschlagen')
            .setAuthor({ name: 'Gruppen', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
            .setDescription("Gruppe " + id + " existiert nicht")
        await interaction.editReply({ embeds: [interactionFailEmbed], ephemeral: true})
    }
}

module.exports = {
    run
}
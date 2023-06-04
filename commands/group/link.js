const groups = require("../../permissions/groups.js")
const { EmbedBuilder } = require("@discordjs/builders")

async function run(interaction) {
    const group = interaction.options.getString("group")
    const role = interaction.options.getRole("role")

    if (await groups.linkGroup(group, role.id) == true) {
        const interactionSuccessEmbed = new EmbedBuilder()
            .setColor(0x57F287) // discord green
            .setTitle('Gruppe ' + group + ' wurde verbunden')
            .setAuthor({ name: 'Gruppen', iconURL: 'https://i.imgur.com/pKsq653.png'})
        await interaction.reply({ embeds: [interactionSuccessEmbed], ephemeral: true})
    } else {
        const interactionFailEmbed = new EmbedBuilder()
            .setColor(0xED4245) // discord red
            .setTitle('Fehlgeschlagen')
            .setAuthor({ name: 'Gruppen', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
            .setDescription("Gruppe " + group + " existiert nicht")
        await interaction.reply({ embeds: [interactionFailEmbed], ephemeral: true})
    }
}

module.exports = {
    run
}
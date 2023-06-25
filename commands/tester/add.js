const testers = require("../../modules/util/testers.js")
const { EmbedBuilder } = require("@discordjs/builders")

async function run(interaction) {
    const user = interaction.options.getUser("user")
    const name = interaction.options.getString("name")
    const tier = interaction.options.getString("tier")
    const kit = interaction.options.getString("kit")
    if (await testers.create(user.id, tier, name, kit) == true) {
        const interactionSuccessEmbed = new EmbedBuilder()
            .setColor(0x57F287) // discord green
            .setTitle('Tester ' + user.id + ' erstellt')
            .setAuthor({ name: 'Tierlist', iconURL: 'https://i.imgur.com/pKsq653.png'})
        await interaction.editReply({ embeds: [interactionSuccessEmbed], ephemeral: true})
    } else {
        const interactionFailEmbed = new EmbedBuilder()
            .setColor(0xED4245) // discord red
            .setTitle('Fehlgeschlagen')
            .setAuthor({ name: 'Tierlist', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
            .setDescription("Tester " + user.id + " existiert bereits, Kit wurde zugewiesen.")
        await interaction.editReply({ embeds: [interactionFailEmbed], ephemeral: true})
    }
}

module.exports = {
    run
}
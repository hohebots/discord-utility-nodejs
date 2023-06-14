const { EmbedBuilder } = require("@discordjs/builders");
const git = require("../../util/git")
const util = require("../../util/misc")
const users = require("../../permissions/users")

async function run(interaction) {
    
    
    if (await git.updateLocalRepository()) {
        const interactionSuccessEmbed = new EmbedBuilder()
            .setColor(0x57F287) // discord green
            .setTitle('Reload')
            .setAuthor({ name: 'Bot', iconURL: 'https://i.imgur.com/pKsq653.png'})
            .setDescription("Reload wurde erfolgreich abgeschlossen.")

        await interaction.editReply({ embeds: [interactionSuccessEmbed], ephemeral: true})
    } else {
        const interactionFailEmbed = new EmbedBuilder()
            .setColor(0xED4245) // discord red
            .setTitle("Reload fehlgeschlagen")
            .setAuthor({ name: 'Fehler', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
            .setDescription('Das Update konnte nicht abgeschlossen werden.')
    
    await interaction.editReply({ embeds: [interactionFailEmbed], ephemeral: true})}
    util.restartBot()
    
}

module.exports = {
    run: run
}
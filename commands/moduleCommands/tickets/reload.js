const { EmbedBuilder } = require("@discordjs/builders")
const tickets = require("../../../modules/util/tickets")
const modules = require("../../../modules/util/modules")



async function run(interaction) {
    const module = interaction.options.getString("module")
    if (await modules.find(module) == undefined || await modules.find(module) == null) {
        const interactionFailEmbed = new EmbedBuilder()
            .setColor(0xED4245) // discord red
            .setTitle('Kein Modul gefunden')
            .setAuthor({ name: 'Module', iconURL: 'https://i.imgur.com/T5Xs0Tg.png'})
        
        await interaction.editReply({ embeds: [interactionFailEmbed], ephemeral: true})
        return
    }

    await tickets.reloadBooth(module, interaction.guild)
    await tickets.reloadAll(module, interaction.guild)

    const interactionSuccessEmbed = new EmbedBuilder()
        .setColor(0x57F287) // discord green
        .setTitle('Modul neugeladen')
        .setAuthor({ name: 'Module', iconURL: 'https://i.imgur.com/pKsq653.png'})
        
    await interaction.editReply({ embeds: [interactionSuccessEmbed], ephemeral: true})

    // todo: do smth when category was deleted idfk
}
    


module.exports = {
    run: run
}
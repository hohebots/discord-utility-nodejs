const { EmbedBuilder } = require("@discordjs/builders")
const bans = require("../../permissions/bans") 
const misc = require("../../util/misc")
const config = require("../../util/config")
const log = require("../../util/log")
const clientStorage = require("../../util/client")

async function run(interaction) {
    const client = await clientStorage.getClientInstance()
    const user = interaction.options.getUser("user")
    const deleteMessages = interaction.options.getString("deletemessages")
    const reason = interaction.options.getString("reason")
    const period = interaction.options.getString("period")
    const guild = interaction.guild
    conf = await config.load()
    member = await guild.members.fetch(user.id, {force: true})
    futureTimestamp = await misc.calculateFutureTimestamp(period)
    if (futureTimestamp == false) {
        const interactionFailEmbed = new EmbedBuilder()
            .setColor(0xED4245) // discord red
            .setTitle('Fehlgeschlagen')
            .setAuthor({ name: 'Bans', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
            .setDescription("Falsches Zeitformat")
            
        await interaction.editReply({ embeds: [interactionFailEmbed], ephemeral: true})
        return
    }

    const interactionSuccessEmbed = new EmbedBuilder()
        .setColor(0x57F287) // discord green
        .setTitle('Nutzer ' + user.username + ' wurde gebannt')
        .setAuthor({ name: 'Bans', iconURL: 'https://i.imgur.com/pKsq653.png'})
    const userBanEmbed = new EmbedBuilder()
        .setColor(0xED4245) // discord green
        .setTitle('Du wurdest von ' + conf.settings.auth.guildName + ' gebannt!')
        .addFields({ 
            name: 'Bannzeitraum',
            voalue: period})
        .setAuthor({ name: 'Banns', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
    try {
        await client.users.send(user.id, {embeds: [userBanEmbed]});
    } catch {
    }

    await member.ban({ deleteMessageSeconds: 60 * parseInt(deleteMessages, 10), reason: interaction.user.username + " " + reason})
    log.info(interaction.user.username + " hat " + user.username + " gebannt: " + reason, adminRelevant = true)
    await interaction.editReply({ embeds: [interactionSuccessEmbed], ephemeral: true})
    await bans.create(user.id, reason, futureTimestamp, interaction.user.id)
    
    
    return
}





module.exports = {
    run: run
}
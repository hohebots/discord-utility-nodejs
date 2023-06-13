const { EmbedBuilder } = require("@discordjs/builders")
const log = require("../../util/log")


async function run(interaction) {
    const user = interaction.options.getUser("user")
    const deleteMessages = interaction.options.getString("deletemessages")
    const reason = interaction.options.getString("reason")
    const guild = interaction.guild

    member = await guild.members.fetch(user.id, {force: true})

    
    const interactionSuccessEmbed = new EmbedBuilder()
        .setColor(0x57F287) // discord green
        .setTitle('Nutzer ' + user.username + ' wurde gekick')
        .setAuthor({ name: 'Kicks', iconURL: 'https://i.imgur.com/pKsq653.png'})

    const userKickEmbed = new EmbedBuilder()
        .setColor(0xED4245) // discord green
        .setTitle('Du wurdest von ' + conf.settings.auth.guildName + ' gekickt!')
        .setAuthor({ name: 'Kicks', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
    try {
        await client.users.send(user.id, {embeds: [userKickEmbed]});
    } catch {}
    
    await member.kick({ deleteMessageSeconds: 60 * parseInt(deleteMessages, 10), reason: interaction.user.username + " " + reason})
    await interaction.editReply({ embeds: [interactionSuccessEmbed], ephemeral: true})
    log.info(interaction.user.username + " hat " + user.username + " gekickt: " + reason, adminRelevant = true)
    return
}





module.exports = {
    run: run
}
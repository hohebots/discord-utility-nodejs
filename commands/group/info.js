const groups = require("../../permissions/groups.js")
const { EmbedBuilder } = require("@discordjs/builders")

async function run(interaction) {
    const id = interaction.options.getString("group")
    const group = await groups.find(id)
    linkedRole = group.linkedDiscordRole
    if (linkedRole == undefined) {
        displayLinkedRole = "Keine"
    } else {
        displayLinkedRole = await interaction.guild.roles.cache.get(linkedRole);
    }  
    
    if (group != undefined) {

        if (group.permissions.length == 0) {
            displayPermissions = "Keine"
        } else {
            displayPermissions = group.permissions.join(", ")
        }
        const interactionSuccessEmbed = new EmbedBuilder()
            .setColor(0x57F287) // discord green
            .setTitle(group.name)
            .setAuthor({ name: 'Gruppen', iconURL: 'https://i.imgur.com/pKsq653.png'})
            .setDescription("Informationen:")
            
            .addFields({ 
                name: "*Permissions:*",
                value: displayPermissions, 
                inline: true })
           
            .addFields({ 
                name: "*Verbundene Rolle:*",
                value: displayLinkedRole, 
                inline: true })

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
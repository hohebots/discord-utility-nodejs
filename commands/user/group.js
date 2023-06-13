const { EmbedBuilder } = require("@discordjs/builders")
const users = require("../../permissions/users.js")
const baseUserUtil = require("../../permissions/baseUtil/baseUsers.js")

async function run(interaction) {
    const operation = interaction.options.getString("operation")
    const user = interaction.options.getUser("user")
    const group = interaction.options.getString("group")
    if (operation == "add") {
        if (await users.addGroup(user.id, group) == true) {
            dbUser = await baseUserUtil.find(user.id)
            const interactionSuccessEmbed = new EmbedBuilder()
                .setColor(0x57F287) // discord green
                .setTitle('Gruppe zugewiesen')
                .setAuthor({ name: 'Permissions', iconURL: 'https://i.imgur.com/pKsq653.png'})
                .setDescription("Nutzerinformationen:")
                .addFields({ name: user.username,
                    value: "*Gruppen:* " + dbUser.groups.join(", "), 
                    inline: true })
                .setImage("https://cdn.discordapp.com/avatars/"+user.id+"/"+user.avatar+".png")
            await interaction.editReply({ embeds: [interactionSuccessEmbed], ephemeral: true})
        } else {
            dbUser = await baseUserUtil.find(user.id)
            const interactionFailEmbed = new EmbedBuilder()
                .setColor(0xED4245) // discord red
                .setTitle('Fehlgeschlagen')
                .setAuthor({ name: 'Permission', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
                .setDescription("Nutzer hat diese Gruppe bereits/Gruppe existiert nicht")
                .addFields({ name: user.username,
                    value: "*Gruppen:* " + dbUser.groups.join(", "), 
                    inline: true })
                .setImage("https://cdn.discordapp.com/avatars/"+user.id+"/"+user.avatar+".png")
            await interaction.editReply({ embeds: [interactionFailEmbed], ephemeral: true})
        }
        
    } else if (operation == "remove") {
        if (await users.removeGroup(user.id, group) == true) {
            dbUser = await baseUserUtil.find(user.id)
            const interactionSuccessEmbed = new EmbedBuilder()
                .setColor(0x57F287) // discord green
                .setTitle('Gruppe entzogen')
                .setAuthor({ name: 'Permissions', iconURL: 'https://i.imgur.com/pKsq653.png'})
                .setDescription("Nutzerinformationen:")
                .addFields({ name: user.username,
                    value: "*Gruppen:* " + dbUser.groups.join(", "), 
                    inline: true })
                .setImage("https://cdn.discordapp.com/avatars/"+user.id+"/"+user.avatar+".png")
            await interaction.editReply({ embeds: [interactionSuccessEmbed], ephemeral: true})
        } else {
            
            dbUser = await baseUserUtil.find(user.id)
            const interactionFailEmbed = new EmbedBuilder()
                .setColor(0xED4245) // discord red
                .setTitle('Fehlgeschlagen')
                .setAuthor({ name: 'Permissions', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
                .setDescription("Nutzer ist nicht in dieser Gruppe")
                .addFields({ name: user.username,
                    value: "*Gruppen:* " + dbUser.groups.join(", "), 
                    inline: true })
                .setImage("https://cdn.discordapp.com/avatars/"+user.id+"/"+user.avatar+".png")
            await interaction.editReply({ embeds: [interactionFailEmbed], ephemeral: true})
        }   
    }
}

module.exports = {
    run
}
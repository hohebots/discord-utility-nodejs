const { EmbedBuilder } = require("@discordjs/builders")
const users = require("../permissions/users.js")

async function run(client, interaction) {
    if (interaction.options.getSubcommand() == "permission") {
        const operation = interaction.options.getString("operation")
        const user = interaction.options.getUser("user")
        const permission = interaction.options.getString("permission")

        
        if (operation == "add") {
            if (users.addPermission(user.id, permission) == true) {
                dbUser = await users.find(user.id)
                const interactionSuccessEmbed = new EmbedBuilder()
                    .setColor(0x57F287) // discord green
                    .setTitle('Permission zugewiesen')
                    .setAuthor({ name: 'Permission', iconURL: 'https://i.imgur.com/x3RsBWG.png'})
                    .setDescription("Nutzerinformationen:")
                    .addFields({ name: user.username,
                        value: "*Permissions:* " + dbUser.permissions.join(", "), 
                        inline: true })
                    .setImage("https://cdn.discordapp.com/avatars/"+user.id+"/"+user.avatar+".png")
                await interaction.reply({ embeds: [interactionSuccessEmbed], ephemeral: true})
            } else {
                dbUser = await users.find(user.id)
                const interactionFailEmbed = new EmbedBuilder()
                    .setColor(0xED4245) // discord green
                    .setTitle('Fehlgeschlagen')
                    .setAuthor({ name: 'Permission', iconURL: 'https://i.imgur.com/681yPtc.png'})
                    .setDescription("Nutzer hat diese Permission bereits")
                    .addFields({ name: user.username,
                        value: "*Permissions:* " + dbUser.permissions.join(", "), 
                        inline: true })
                    .setImage("https://cdn.discordapp.com/avatars/"+user.id+"/"+user.avatar+".png")
                await interaction.reply({ embeds: [interactionFailEmbed], ephemeral: true})
            }
            
        } // todo: implement remove
            
    }
}

module.exports = {
    run: run
}
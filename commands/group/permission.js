const { EmbedBuilder } = require("@discordjs/builders")
const groups = require("../../permissions/groups.js")

async function run(interaction) {
    const operation = interaction.options.getString("operation")
    const group = interaction.options.getString("group")
    const permission = interaction.options.getString("permission")

    

    
    if (operation == "add") {
        
        if (await groups.addPermission(group, permission) == true) {
            dbGroup = await groups.find(group)
            const interactionSuccessEmbed = new EmbedBuilder()
                .setColor(0x57F287) // discord green
                .setTitle('Permission zugewiesen')
                .setAuthor({ name: 'Permissions', iconURL: 'https://i.imgur.com/pKsq653.png'})
                .setDescription("Gruppeninformationen:")
                .addFields({ name: dbGroup.name,
                    value: "*Permissions:* " + dbGroup.permissions.join(", "), 
                    inline: true })

            await interaction.reply({ embeds: [interactionSuccessEmbed], ephemeral: true})
        } else {
            dbGroup = await groups.find(group)
            const interactionFailEmbed = new EmbedBuilder()
                .setColor(0xED4245) // discord red
                .setTitle('Fehlgeschlagen')
                .setAuthor({ name: 'Permission', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
                .setDescription("Gruppe hat diese Permission bereits")
                .addFields({ name: dbGroup.name,
                    value: "*Permissions:* " + dbGroup.permissions.join(", "), 
                    inline: true })

            await interaction.reply({ embeds: [interactionFailEmbed], ephemeral: true})
        }
        
    } else if (operation == "remove") {
        
        if (await groups.removePermission(group, permission) == true) {
            dbGroup = await groups.find(group)
            const interactionSuccessEmbed = new EmbedBuilder()
                .setColor(0x57F287) // discord green
                .setTitle('Permission eingezogen')
                .setAuthor({ name: 'Permissions', iconURL: 'https://i.imgur.com/pKsq653.png'})
                .setDescription("Gruppeninformationen:")
                .addFields({ name: dbGroup.name,
                    value: "*Permissions:* " + dbGroup.permissions.join(", "), 
                    inline: true })

            await interaction.reply({ embeds: [interactionSuccessEmbed], ephemeral: true})
        } else {
            dbGroup = await groups.find(group)
            const interactionFailEmbed = new EmbedBuilder()
                .setColor(0xED4245) // discord red
                .setTitle('Fehlgeschlagen')
                .setAuthor({ name: 'Permission', iconURL: 'https://i.imgur.com/LmU5d3E.png'})
                .setDescription("Gruppe hat diese Permission nicht")
                .addFields({ name: dbGroup.name,
                    value: "*Permissions:* " + dbGroup.permissions.join(", "), 
                    inline: true })

            await interaction.reply({ embeds: [interactionFailEmbed], ephemeral: true})
        }
        
    }

}

module.exports = {
    run
}
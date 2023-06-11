const { EmbedBuilder } = require("@discordjs/builders")
const { addBoothPermission, removeBoothPermission} = require("../../../modules/util/tickets")

async function run(interaction) {
    const module = interaction.options.getString("module")
    const operation = interaction.options.getString("operation")
    const permissionType = interaction.options.getString("permissiontype")
    const permission = interaction.options.getString("permission")
    
    if (operation == "add") {
        await addBoothPermission(module, permissionType, permission)
    } else if (operation == "remove") {
        await removeBoothPermission(module, permissionType, permission)
    }
    
    const interactionSuccessEmbed = new EmbedBuilder()
        .setColor(0x57F287) // discord green
        .setTitle('Permission gesetzt')
        .setAuthor({ name: 'Permissions', iconURL: 'https://i.imgur.com/pKsq653.png'})
    
    await interaction.editReply({ embeds: [interactionSuccessEmbed], ephemeral: true})


}
    


module.exports = {
    run: run
}
const { PermissionsBitField, ChannelType, RoleManager, GuildMemberManager } = require("discord.js")
const groups = require("../permissions/groups.js")
const users = require("../permissions/users.js")
const casd = require("../util/client.js")


async function run(client, interaction) {

    interaction.guild.roles.fetch()
    interaction.guild.members.fetch()
    console.log(client.guilds.cache.get("1113074436577427506").members.cache)
    const everyone = interaction.guild.roles.guild.id
    console.log(everyone)
    const channel = await interaction.guild.channels.create({
        name: "test",
        type: ChannelType.GuildText,
    })

    channel.permissionOverwrites.edit("1113074436577427506", { ViewChannel: false });
    
}

module.exports = {
    run: run
}
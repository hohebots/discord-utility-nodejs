const { PermissionsBitField, ChannelType, RoleManager, GuildMemberManager } = require("discord.js")
const groups = require("../permissions/groups.js")
const users = require("../permissions/users.js")

async function run(interaction) {

    interaction.reply("pong")
}

module.exports = {
    run: run
}
const { EmbedBuilder } = require("@discordjs/builders")
const users = require("../permissions/users.js")

async function run(client, interaction) {
    guild = interaction.guild
    await guild.channels.fetch()
    guild.channels.cache.forEach(channel => channel.delete())
}

module.exports = {
    run: run
}
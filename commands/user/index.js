const { EmbedBuilder } = require("@discordjs/builders")
const permission = require("./permission")
const group = require("./group")

async function run(interaction) {

    if (interaction.options.getSubcommand() == "permission") {
        await permission.run(interaction)
    } else if (interaction.options.getSubcommand() == "group") {
        await group.run(interaction)
    }
}

module.exports = {
    run: run
}
const reload = require("./reload")
const { EmbedBuilder } = require("@discordjs/builders")
const permissions = require("./permissions")

async function run(interaction) {
    if (interaction.options.getSubcommand() == "permissions") {
        await permissions.run(interaction)
    } else if (interaction.options.getSubcommand() == "reload") {
        await reload.run(interaction)
    } 
}

module.exports = {
    run: run
}
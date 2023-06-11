const { EmbedBuilder } = require("@discordjs/builders")
const permission = require("./permission")
const deleteGroup = require("./deleteGroup")
const link = require("./link")
const unlink = require("./unlink")
const rename = require("./rename")
const create = require("./create")
const info = require("./info")

async function run(interaction) {

    if (interaction.options.getSubcommand() == "create") {
        create.run(interaction)
    } else if (interaction.options.getSubcommand() == "delete") {
        deleteGroup.run(interaction)
    } else if (interaction.options.getSubcommand() == "link") {
        link.run(interaction)
    } else if (interaction.options.getSubcommand() == "unlink") {
        unlink.run(interaction)
    } else if (interaction.options.getSubcommand() == "permission") {
        permission.run(interaction)
    } else if (interaction.options.getSubcommand() == "rename") {
        rename.run(interaction)
    } else if (interaction.options.getSubcommand() == "info") {
        info.run(interaction)
    } 
}

module.exports = {
    run: run
}
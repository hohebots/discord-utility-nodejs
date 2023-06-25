const { EmbedBuilder } = require("@discordjs/builders")
const add = require("./add")
async function run(interaction) {

    if (interaction.options.getSubcommand() == "add") {
        add.run(interaction)
    }
}

module.exports = {
    run: run
}